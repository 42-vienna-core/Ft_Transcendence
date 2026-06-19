import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { GameRoomService } from 'src/gameRoom/gameRoom.service';
import { GameRoomModule } from 'src/gameRoom/gameRoom.module';
// import { DatabaseModule } from 'src/prisma/prisma.module';

@Module({
  imports: [GameRoomModule, ],
  providers: [SocketGateway, SocketService, GameRoomService],
  exports: [SocketService],
})
export class SocketModule {}
