import { WebSocketServer, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  }
})
export class RoomGateway {
  
  @WebSocketServer()
  "server": Server;
}
