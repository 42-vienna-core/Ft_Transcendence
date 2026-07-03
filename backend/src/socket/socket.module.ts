import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { GameRoomService } from 'src/gameRoom/gameRoom.service';
import { GameRoomModule } from 'src/gameRoom/gameRoom.module';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from 'src/redis/redis.module';
@Module({
  imports: [GameRoomModule, DatabaseModule, AuthModule, RedisModule],
  providers: [SocketGateway, SocketService, GameRoomService],
  exports: [SocketService],
})
export class SocketModule {}
