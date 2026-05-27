import {WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
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
}
