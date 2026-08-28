import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { RedisService } from 'src/redis/redis.service';
import { MatchStarter } from '../matchStarter/matchStarter.service';
import { MatchRequestDto } from '../matchStarter/dto/match.dto';
import { RoomStatus } from "@prisma/client";
import { GameRoomService } from 'src/gameRoom/gameRoom.service';
import { setTimeout as wait } from 'node:timers/promises';
import { TokenService } from 'src/token/token.service';
import { SessionService } from 'src/session/session.service';
import { UnauthorizedException } from '@nestjs/common';
import { FriendsService } from 'src/friends/friends.service';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { Match } from 'src/gameRoom/interfaces/room-update.interface';
import type { friendRequestData } from 'src/friends/interfaces/friend-request-data.interface';

const COUNTDOWN = 3; // seconds

@WebSocketGateway({ cors: { origin: '*' } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  constructor(
    private readonly roomService: GameRoomService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly matchStarter: MatchStarter,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
	private readonly eventEmitter: EventEmitter2,
    private readonly friendsService: FriendsService,
  ) { }

  async handleConnection(client: Socket) {
    console.log('🟣 SOCKET handleConnection');
    try {
      const token = client.handshake.auth.token;
      if (!token)
        throw new UnauthorizedException("Unauthorized");

      const payload = await this.tokenService.verifyAccessToken(token);
      const session = await this.sessionService.findSessionById(payload.sessionId);
      if (!session)
        throw new UnauthorizedException("Unauthorized");
      if (session.userId !== payload.userId)
        throw new UnauthorizedException("Unauthorized");
      const user = await this.userService.getUser(payload.userId);
      if (!user)
        throw new UnauthorizedException("Unauthorized");

      client.data.userId = payload.userId;
      client.data.sessionId = payload.sessionId;
      client.data.user = user;

	  await client.join(`user:${payload.userId}`);

      await this.redisService.addOnline(user, session.id);
    } catch (e) {
      console.log(e);
      client.disconnect();
    }
  }

    async handleDisconnect(client: Socket) {
   try {
    console.log("🟣 SOCKET handleDisconnect");

    await this.redisService.removeOnline(client.data.userId, client.data.sessionId);

    const roomUser = await this.roomService.findBySocketId(client.id);
    if (!roomUser)
		return;
	if (roomUser.userId === roomUser.room.ownerId){
		const abandoned  = await this.matchStarter.updateAbandonedRoom(roomUser.roomId);
		if (abandoned)
			return ;
	}
    await this.roomService.removeUserFromRoom(roomUser.roomId, roomUser.userId);
	this.eventEmitter.emit('playing-friends.changed', {userIds: [roomUser.userId]});
	const match = await this.roomService.getRoomUpdate(roomUser.roomId);

	this.server.to(roomUser.roomId).emit('room-update', match);
   } catch (error) {
    console.log('handleDisconnect: error while cleaning up client', error instanceof Error ? error.message : error);
   }
  }

  @SubscribeMessage("get-online-users")
  async getOnlineUsers(client: Socket) {
    console.log("get_online-users: ", client.id);
    const onlineUsers = await this.redisService.getOnlineUsers();
    this.server.emit("online-users", onlineUsers);
  }

  	@SubscribeMessage('join-match')
		async handleJointMatch(@ConnectedSocket() client: Socket, @MessageBody() data: MatchRequestDto){
		
		console.log(" >>>> join match was called");
		console.log("data: ", data);

    	if (!client.data.user) {
    	  console.log("ERROR !client.data.user || client.data.user === undefined");
    	  client.disconnect();
    	  return;
    	}

		const match = await this.matchStarter.prepareMatch(
			client.data.user.id, 
			client.id, data
		);
		client.data.roomId = match.roomId;
		await client.join(match.roomId);

		const curMatch = await this.roomService.getRoomUpdate(match.roomId);
		if (curMatch.roomStatus === RoomStatus.ABANDONED){
			client.emit('room-update', curMatch);
			await this.roomService.removeUserFromRoom(curMatch.roomId, client.data.user.id);
			await client.leave(match.roomId);
			delete client.data.roomId;
			return curMatch;
		}

		this.server.to(client.data.roomId).emit('room-update', curMatch);

		if (curMatch.roomStatus === RoomStatus.READY){
			this.server.to(curMatch.roomId).emit('countdown', {roomId: curMatch.roomId, countdown: COUNTDOWN});
			await wait(COUNTDOWN * 1000);
			await this.matchStarter.startMatch(curMatch.roomId);
		}
    	console.log("ROOM STATUS: ", match.roomStatus);
		return curMatch;
	}

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody('roomId') roomId: string) {
	console.log("LEAVE ROOM CALLED");
	const roomUser = await this.roomService.findBySocketId(client.id);
	if (roomUser === null)
		return { success: false };
	if (roomId !== roomUser.roomId)
		return { success: false };
	if (roomUser.userId === roomUser.room.ownerId){
		const abandoned  = await this.matchStarter.updateAbandonedRoom(roomUser.roomId);
		if (abandoned)
		    return { success: true };
	}
    await client.leave(roomUser.roomId);
    await this.roomService.removeUserFromRoom(roomUser.roomId, roomUser.userId);
	this.eventEmitter.emit('playing-friends.changed', {userIds: [roomUser.userId]});
	const match = await this.roomService.getRoomUpdate(roomUser.roomId);
	this.server.to(roomUser.roomId).emit('room-update', match);

    return { success: true };
  }

  @OnEvent('playing-friends.changed')
  async handlePlayingFrendsChanged(event: {userIds: number[]}){
	console.log("playing friends changed");
	const friends = await Promise.all(event.userIds.map((userId) => this.friendsService.getFriends(userId)));
	const recipients = new Set(friends.flat().map((friend) => friend.id));
	for (const friend of recipients)
		this.server.to(`user:${friend}`).emit('playing-friends-changed');
  }

  @OnEvent('friend-match.created')
  async handleNewfriendMatch(event: { ownerId: number, roomId: string, status: RoomStatus }){
	const owner = await this.userService.getUser(event.ownerId);
	const friends = await this.friendsService.getFriends(event.ownerId);
	for (const friend of friends){
		this.server.to(`user:${friend.id}`).emit('friend-match-invite', {
			roomId: event.roomId,
			status: event.status,
			inviter: {
				id: owner.id,
				name: owner.name,
				avatar: owner.avatar, 
			}
		});
	}
	console.log("FRIEND MATCH: invite sent!");
  }

  @OnEvent('friend-match.status')
  async broadcastFriendMatchStatus(event: {ownerId: number, roomId: string, status: RoomStatus}){
	const friends = await this.friendsService.getFriends(event.ownerId);
	for (const friend of friends){
		this.server.to(`user:${friend.id}`).emit('friend-match-status', {
			roomId: event.roomId,
			status: event.status,
		});
	}
	console.log("FRIEND MATCH: updated status sent!");
  }

  @OnEvent('match.countdown')
  handleMatchCountdown(event: {countdown: number, match: Match}){
	this.server.to(event.match.roomId).emit('room-update', event.match);
	this.server.to(event.match.roomId).emit('countdown', {
		countdown: event.countdown, 
		roomId: event.match.roomId
  	});
  }

  @OnEvent('match.abandoned')
  handleAbandonedMatch(event: {match: Match, socketIds: string[]}){
	this.server.to(event.match.roomId).to(event.socketIds).emit('room-update', event.match);
	this.server.in(event.match.roomId).socketsLeave(event.match.roomId);
  }

  @OnEvent('friend-request.received')
  handleFriendRequestNotification(event: friendRequestData){
	this.server.to(`user:${event.receiverId}`).emit('friend-request-received', event.request);
  }

  @SubscribeMessage('get-playing-friends')
  async getPlayingFriends(@ConnectedSocket() client: Socket){
	console.log("get playing friends");
	return this.friendsService.getPlayingFriends(client.data.user.id);
  }

}
