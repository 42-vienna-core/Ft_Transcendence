import { Module } from '@nestjs/common';
import { GameRoomController } from './gameRoom.controller';
import { GameRoomService } from './gameRoom.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GameRoomController],
  providers: [GameRoomService],
  exports: [GameRoomService],
})
export class GameRoomModule {}
