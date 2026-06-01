import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { RoomService } from 'src/room/room.service';
import { RoomModule } from 'src/room/room.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [RoomModule, DatabaseModule],
  providers: [SocketGateway, SocketService, RoomService],
  exports: [SocketService],
})
export class SocketModule {}
