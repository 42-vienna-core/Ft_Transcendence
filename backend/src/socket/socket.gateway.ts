import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameRoomService } from 'src/gameRoom/gameRoom.service';
import { AuthService } from 'src/auth/auth.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateSnake } from 'src/types/interface';
@WebSocketGateway(2000, { cors: { origin: 'http://localhost:3000', credentials: true, } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  constructor(
    private readonly roomService: GameRoomService,
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
  ) {}
// redis updata command (        redis-cli FLUSHALL        )

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
    console.log("handleConnection was caled ", client.id);
    const user = await this.getUser(client);
    if (!user) { 
      client.disconnect();
      return ;
    }
    client.data.user = user;
    console.log("socket was connected", client.data);
    const addedUser = await this.redisService.addOnlineUser(user);
    if (addedUser)
      await this.getOnlineUsers(client);
  }

   async handleDisconnect(client: Socket) {
    console.log("handleDisconnect was caled ")
    await this.redisService.removeOnlineUser(client.data.user.id);
    await this.getOnlineUsers(client)
    const roomUser = await this.roomService.findBySocketId(client.id);
  
    if (!client.data.roomId || !roomUser) return ;
    await this.roomService.removeUserFromRoom(client.data.roomId, client.data.user.id);
    const players = await this.roomService.getPlayerCount(roomUser.roomId);
    this.server.to(client.data.roomId).emit('room-update', {
      roomId: roomUser.roomId,
      roomStatus: client.data.roomStatus,
      players,
    });
  }

  @SubscribeMessage("get-online-users")
  async getOnlineUsers(client: Socket) {
    console.log("get_online-users: ", client.id);
    const onlineUsers = await this.redisService.getOnlineUsers();
    this.server.emit("online-users", onlineUsers);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(@ConnectedSocket() client: Socket) {
   
    console.log(" >>>> handleJoinRoom was caled");

    if (client.data.user === undefined)
      client.data.user = await  this.getUser(client);

    const room = await this.roomService.createRoom(client.data.user.id);
    client.data.roomId = room.roomId;
    
    await this.redisService.set(`game:${room.roomId}:${client.data.user.id}`, JSON.stringify(CreateSnake(client.data.user.id)))
    await client.join(room.roomId);

    await this.roomService.addUserToRoom(room.roomId, client.data.user.id, client.id);
    const players = await this.roomService.getPlayerCount(client.data.roomId);
    this.server.to(client.data.roomId).emit('room-update', {
      roomId: room.roomId,
      roomStatus: room.status,
      players,
    });
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(@ConnectedSocket() client: Socket) {
    console.log(" >>>> handleLeaveRoom was caled", client.id, client.data.roomId);

    await this.roomService.removeUserFromRoom(client.data.roomId, client.data.user.id);
    await client.leave(client.data.roomId);

    await this.redisService.del(`game:${client.data.roomId}:${client.data.user.id}`);

    const players = await this.roomService.getPlayerCount(client.data.roomId);
    this.server.to(client.data.roomId).emit('room-update', {
      roomId: client.data.roomId,
      roomStatus: client.data.roomStatus,
      players,
    });
  }

  @SubscribeMessage('player-move')
  async handlePlayerMove( @ConnectedSocket() client: Socket, @MessageBody() newPos: { x: number, y: number}) {
     console.log(" >>>> handlePlayerMove was caled", client.id);
    
    await this.redisService.updatePlayerPosition( 
      client.data.roomId, client.data,
      { x: newPos.x, y: newPos.y }
    );
    this.server.to(client.data.roomId).emit('player-moved', {
      userId: client.data.user.id,
      x: newPos.x,
      y: newPos.y,
    })
  }
}
