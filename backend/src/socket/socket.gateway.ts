import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameRoomService } from 'src/gameRoom/gameRoom.service';
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
  const cookie = client.handshake.headers.cookie ?? "";
  const accessToken = cookie.split(";").map((c) => c.trim())
  .find((c) => c.startsWith("accessToken="))?.slice("accessToken=".length);

  if (!accessToken) {
    client.disconnect();
    return null;
  }
  return await this.authService.me(accessToken);
}

  async handleConnection(client: Socket) {
  
    const user = await this.getUser(client);
    if (!user) { 
      client.disconnect();
      return;
    }
    client.data.userId = user.id;
    client.data.Username = user.Username;
    client.data.x = 0;
    client.data.y = 0;
    const room  = await this.roomService.createRoom(client.data.userId);
    client.data.roomId = room.roomId;
    client.data.roomStatus = room.status;
    await this.handleJoinRoom(client);

    if (await this.redisService.addOnlineUser(client.data))
       this.server.emit('user-online', { userId: user.id, Username: user.Username });
    const onlineUsers = await this.redisService.getOnlineUsers();
  
    this.server.emit('online-users', onlineUsers);
  }

   async handleDisconnect(client: Socket) {
    
    const roomUser = await this.roomService.findBySocketId(client.id);
    if (!roomUser) return ;
  
    await this.redisService.removeOnlineUser(client.data.userId);
    this.server.emit('user-offline',  { userId: client.data.userId, Username: client.data.Username });
    await this.roomService.removeUserFromRoom(client.data.roomId, client.data.userId);
    const players = await this.roomService.getPlayerCount(roomUser.roomId);
    this.server.to(client.data.roomId).emit('room-update', {
      roomId: roomUser.roomId,
      roomStatus: client.data.roomStatus,
      players,
    });
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(@ConnectedSocket() client: Socket) {
   
    console.log(" >>>> handleJoinRoom was caled");

    await client.join(client.data.roomId);

    await this.roomService.addUserToRoom(client.data.roomId, client.data.userId, client.id);
    const players = await this.roomService.getPlayerCount(client.data.roomId);
    this.server.to(client.data.roomId).emit('room-update', {
      roomId: client.data.roomId,
      roomStatus: client.data.roomStatus,
      players,
    });
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(@ConnectedSocket() client: Socket) {
    console.log(" >>>> handleLeaveRoom was caled");

    await client.leave(client.data.roomId);
    await this.roomService.removeUserFromRoom(client.data.roomId, client.data.userId);
    const players = await this.roomService.getPlayerCount(client.data.roomId);
    this.server.to(client.data.roomId).emit('room-update', {
      roomId: client.data.roomId,
      roomStatus: client.data.roomStatus,
      players,
    });
    return { success: true, players };
  }

  @SubscribeMessage('player-move')
  async handlePlayerMove( @ConnectedSocket() client: Socket, @MessageBody() newPos: { x: number, y: number}) {
    console.log(" >>>> handlePlayerMove was caled");
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
