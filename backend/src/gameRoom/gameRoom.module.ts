import { Module } from '@nestjs/common';
import { GameRoomController } from './gameRoom.controller';
import { GameRoomService } from './gameRoom.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GameRoomController],
  providers: [GameRoomService],
  exports: [GameRoomService],
})
export class GameRoomModule {}
