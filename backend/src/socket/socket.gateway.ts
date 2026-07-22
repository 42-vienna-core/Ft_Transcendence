import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AddUserGameRoomDto } from '../gameRoom/dto/addUser-gameRoom.dto';
import { UserService } from 'src/user/user.service';
import { RedisService } from 'src/redis/redis.service';
import { MatchStarter } from '../matchStarter/matchStarter.service';
import { StartMatchDto } from '../matchStarter/dto/match.dto';
import { RoomStatus } from 'prisma/generated';
import { GameRoomService } from 'src/gameRoom/gameRoom.service';


@WebSocketGateway({ cors: { origin: '*' } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  constructor(
    private readonly roomService: GameRoomService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly matchStarter: MatchStarter,
  ) {}

  @SubscribeMessage("get-online-users")
  async getOnlineUsers(client: Socket) {
    console.log("get_online-users: ", client.id);
    const onlineUsers = await this.redisService.getOnlineUsers();
    this.server.emit("online-users", onlineUsers);
  }

  async handleConnection(client: Socket) {
    let user;
    try {
      user = await this.userService.verifyUser(client.handshake.auth.token);
    } catch (error) {
      console.log('handleConnection: auth failed, disconnecting client', error instanceof Error ? error.message : error);
      client.disconnect(true);
      return;
    }

    if (!user) {
      client.disconnect(true);
      return;
    }

    client.data.user = user;
    const addedUser = await this.redisService.addOnlineUser(user);
    if (addedUser)
        await this.getOnlineUsers(client);
  }

  // @SubscribeMessage('join-room')
  // async handleJoinRoom(@ConnectedSocket() client: Socket) {
   
  //   console.log(" >>>> handleJoinRoom was called", client);

  //   if (client.data.user === undefined)
  //     client.data.user = await  this.userService.verifyUser(client.handshake.auth.token);

  //   const room = await this.roomService.createRoom({
  //     name: `Room-${client.data.user.username}`,
  //     maxUsers: 1, 
  //     type: 'PUBLIC'     
  //   });

  //   client.data.roomId = room.id;
  //   client.data.roomStatus = room.status; //save a status for redis disconnect
    
  //   await this.redisService.set(
  //     `game:${room.id}:${client.data.user.id}`,
  //     JSON.stringify(client.data.user)
  //   ) // instead of this object ( client.data.user ) will be that object for each user for the game
    
  //   // add socket into room socket.io 
  //   await client.join(room.id);

  //   await this.roomService.addUserToRoom(room.id, client.data.user.id, client.id);
  //   const players = await this.roomService.getPlayerCount(client.data.roomId);
    
  //   this.server.to(client.data.roomId).emit('room-update', {
  //     roomId: room.id,
  //     roomStatus: room.status,
  //     players,
  //   });
  // }

  @SubscribeMessage('join-match')
	async handleJointMatch(@ConnectedSocket() client: Socket, @MessageBody() data: StartMatchDto){
		
		console.log(" >>>> start match was called");
		console.log("data: ", data);
		
		if (client.data.user === undefined) {
			try {
				client.data.user = await this.userService.verifyUser(client.handshake.auth.token);
			} catch (error) {
				console.log('handleJointMatch: auth failed, disconnecting client', error instanceof Error ? error.message : error);
				client.disconnect(true);
				return;
			}
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
  async handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: AddUserGameRoomDto ) {
    await client.leave(data.roomId);
    await this.roomService.removeUserFromRoom(data.roomId, data.userId);
    const players = await this.roomService.getPlayerCount(data.roomId);
    this.server.to(data.roomId).emit('room-update', {
      roomId: data.roomId,
      players,
    });
    return { success: true, players };
  }

  async handleDisconnect(client: Socket) {
   try {
    await this.redisService.removeOnlineUser(client.data.id);
    await this.getOnlineUsers(client);

    const roomUser = await this.roomService.findBySocketId(client.id);
    if (!client.data.roomId || !roomUser) return ;

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
}
