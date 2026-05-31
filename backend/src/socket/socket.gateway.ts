import {WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import {Server, Socket} from "socket.io"

@WebSocketGateway(2000,{
  cors: {
    origin: '*',
  }
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log("Client connected:", client.id)
  }
  
  handleDisconnect(client: Socket) {
      console.log("Client was disconnected: ", client.id);
  }
  @SubscribeMessage("join-room")
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      roomId: string;
      userId: string;
    },
  ) {
    client.join(data.roomId);
    
    const room = this.server.sockets.adapter.rooms.get(data.roomId);
    const players = room?.size ?? 0;
    this.server.to(data.roomId).emit("room-update", {
      players,
    })
    return {
      success: true,
    }
  }
}
