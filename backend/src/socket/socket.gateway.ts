import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameRoomService } from 'src/gameRoom/gameRoom.service';
import { AddUserGameRoomDto } from 'src/dto/addUser-gameRoom.dto';
import { AuthService } from 'src/auth/auth.service';
import { RedisService } from 'src/redis/redis.service';
@WebSocketGateway(2000, { cors: { origin: 'http://localhost:3000', credentials: true, } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  constructor(
    private readonly roomService: GameRoomService,
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
  ) {}

  async getUser(client: Socket) {
     const accessToken = client.handshake.headers.cookie?.split(';').find((cookie) => cookie.trim().startsWith('accessToken='))?.split('=')[1];
    if (!accessToken) {
      client.disconnect();
      return;
    }
    return await this.authService.me(accessToken || "");
  }

  async handleConnection(client: Socket) {
  
    console.log("this is client.id > ", client.id);
    const res = await this.getUser(client);
    console.log("this is res.id > ", res.id);

    await this.redisService.addOnlineUser(res.id.toString(), client.id);
    const room  = await this.roomService.createRoom(res.id);
    return this.handleJoinRoom( client, { userId: res.id, roomId: room.roomId });
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: AddUserGameRoomDto ) {
    client.data.userId = data.userId;
    client.data.roomId = data.roomId;
    client.data.x = 0;
    client.data.y = 0;
    await client.join(data.roomId);

    await this.roomService.addUserToRoom(data.roomId, data.userId, client.id);
    const onlineUsers = await this.redisService.getOnlineUsers();
    this.server.emit('online-users-updatet', onlineUsers);
    const players = await this.roomService.getPlayerCount(data.roomId);
    this.server.to(data.roomId).emit('room-update', {
      roomId: data.roomId,
      players,
    });
    return { success: true, players };
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
    const roomUser = await this.roomService.findBySocketId(client.id);
    if (!roomUser)
      return;

    console.log("will remove this id >", client.data.userId)
    await this.redisService.removeOnlineUser(client.data.userId);
    const onlineUsers = await this.redisService.getOnlineUsers();
    this.server.emit('online-users-updated', onlineUsers);
   
    await this.roomService.removeUserFromRoom(client.data.roomId, client.data.userId);
    const players = await this.roomService.getPlayerCount(roomUser.roomId);
    this.server.to(client.data.roomId).emit('room-update', {
      roomId: roomUser.roomId,
      players,
    });
  }
  
  @SubscribeMessage('player-move')
  async handlePlayerMove( @ConnectedSocket() client: Socket, @MessageBody() newPos: { x: number, y: number}) {
    const userId = client.data.userId;
    const roomId = client.data.roomId;
    await this.redisService.updatePlayerPosition( 
      roomId, userId,
      { x: newPos.x, y: newPos.y }
    );
    this.server.to(client.data.roomId).emit('player-moved', {
      userId,
      x: newPos.x,
      y: newPos.y,
    })
  }

}
