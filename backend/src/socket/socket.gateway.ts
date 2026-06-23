import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameRoomService } from 'src/gameRoom/gameRoom.service';
import { AddUserGameRoomDto } from 'src/dto/addUser-gameRoom.dto';

@WebSocketGateway(2000, { cors: { origin: '*' } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  constructor(private readonly roomService: GameRoomService) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: AddUserGameRoomDto ) {
    client.data.userId = data.userId;
    client.data.roomId = data.roomId;
    await client.join(data.roomId);
    
    await this.roomService.addUserToRoom(data.roomId, data.userId, client.id);
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
    if (!roomUser) return;

    const { userId, roomId } = client.data as {
      userId: number;
      roomId: string;
    };

    if (roomId && userId) {
      await this.roomService.removeUserFromRoom(roomId, userId);
      const players = await this.roomService.getPlayerCount(roomUser.roomId);
      this.server.to(roomId).emit('room-update', {
        roomId: roomUser.roomId,
        players,
      });
    }
  }
}
