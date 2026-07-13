import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameRoomService } from '../gameRoom/gameRoom.service';
import { AddUserGameRoomDto } from '../gameRoom/dto/addUser-gameRoom.dto';
import { UserService } from 'src/user/user.service';
import { RedisService } from 'src/redis/redis.service';


@WebSocketGateway({ cors: { origin: '*' } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  constructor(
    private readonly roomService: GameRoomService,
    private readonly userService: UserService,
    private readonly redisService: RedisService
  ) {}

  @SubscribeMessage("get-online-users")
  async getOnlineUsers(client: Socket) {
    console.log("get_online-users: ", client.id);
    const onlineUsers = await this.redisService.getOnlineUsers();
    this.server.emit("online-users", onlineUsers);
  }

  async handleConnection(client: Socket) {

    console.log('handleConnection caled');
    const user = await this.userService.verifyUser(client.handshake.auth.token);
    if (!user) {
      console.log("========================?????????????????========================")
      client.disconnect();
      return;
    }
    client.data.user = user;
    const addedUser = await this.redisService.addOnlineUser(user);
    if (addedUser)
        await this.getOnlineUsers(client);

    console.log("this is the user", user)

  }

  async handleJoinRoom(@ConnectedSocket() client: Socket) {
   
    console.log(" >>>> handleJoinRoom was caled");

    if (client.data.user === undefined)
      client.data.user = await  this.userService.verifyUser(client.handshake.auth.token);

    const room = await this.roomService.createRoom(client.data.user.id);
    client.data.roomId = room.id;
    
    await this.redisService.set(`game:${room.id}:${client.data.user.id}`,
      JSON.stringify(client.data.user)) // instead of this object ( client.data.user ) will be that object for each user for the game
    await client.join(room.id);

    await this.roomService.addUserToRoom(room.id, client.data.user.id, client.id);
    const players = await this.roomService.getPlayerCount(client.data.roomId);
    this.server.to(client.data.roomId).emit('room-update', {
      roomId: room.id,
      roomStatus: room.status,
      players,
    });
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
    console.log(" handleDisconnect was caled");

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
  }
}
