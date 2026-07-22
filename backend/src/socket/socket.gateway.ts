import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AddUserGameRoomDto } from '../gameRoom/dto/addUser-gameRoom.dto';
import { UserService } from 'src/user/user.service';
import { RedisService } from 'src/redis/redis.service';
import { MatchStarter } from '../matchStarter/matchStarter.service';
import { StartMatchDto } from '../matchStarter/dto/match.dto';
import { RoomStatus } from "@prisma/client";
import { GameRoomService } from 'src/gameRoom/gameRoom.service';

import { TokenService } from 'src/token/token.service';
import { SessionService } from 'src/session/session.service';
import { UnauthorizedException } from '@nestjs/common';

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

      const addedUser = await this.redisService.addOnlineUser(user, session.id);
      if (addedUser)
        await this.getOnlineUsers(client);
      console.log("this is the user", user)
    } catch (e) {
      console.log(e);
      client.disconnect();
    }
  }

    async handleDisconnect(client: Socket) {
   try {
    console.log("🟣 SOCKET handleDisconnect");

    await this.redisService.removeOnlineUser(client.data.id);
    await this.getOnlineUsers(client);

    const roomUser = await this.roomService.findBySocketId(client.id);
    if (!client.data.roomId || !roomUser) return;

    await this.roomService.removeUserFromRoom(client.data.roomId, client.data.user.id);
    const players = await this.roomService.getPlayerCount(roomUser.roomId);
    this.server.to(client.data.roomId).emit('room-update', {
      roomId: roomUser.roomId,
      roomStatus: client.data.roomSatus,
      players,
    });
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
	async handleJointMatch(@ConnectedSocket() client: Socket, @MessageBody() data: StartMatchDto){
		
		console.log(" >>>> start match was called");
		console.log("data: ", data);

    if (!client.data.user) {
      console.log("ERROR !client.data.user || client.data.user === undefined");
      client.disconnect();
      return;
    }

		const match = await this.matchStarter.prepareMatch(
			client.data.user.id, 
			client.id, data.mode
		);
		console.log("MATCH: ",match);
		client.data.roomId = match.roomId;
		await client.join(match.roomId);
		
		this.server.to(client.data.roomId).emit('room-update', {
			roomId: match.roomId,
			roomStatus: match.roomStatus,
			players: match.players,
		});
		if (match.roomStatus === RoomStatus.READY)
			await this.matchStarter.startMatch(match.roomId);
    console.log("ROOM STATUS: ", match.roomStatus);
		return match;
	}

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: AddUserGameRoomDto) {
    await client.leave(data.roomId);
    await this.roomService.removeUserFromRoom(data.roomId, data.userId);
    const players = await this.roomService.getPlayerCount(data.roomId);
    this.server.to(data.roomId).emit('room-update', {
      roomId: data.roomId,
      players,
    });
    return { success: true, players };
  }

}
