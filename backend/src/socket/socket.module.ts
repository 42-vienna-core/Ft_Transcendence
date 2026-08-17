import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { GameRoomService } from '../gameRoom/gameRoom.service';
import { GameRoomModule } from 'src/gameRoom/gameRoom.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from 'src/redis/redis.module';
import { MatchModule } from 'src/matchStarter/matchStarter.module';
import { TokenModule } from 'src/token/token.module';
import { SessionModule } from 'src/session/session.module';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
  imports: [
    GameRoomModule, 
    PrismaModule, 
    UserModule, 
    RedisModule, 
    MatchModule, 
    TokenModule, 
    SessionModule,
	FriendsModule
  ],
  providers: [
    SocketGateway, 
    SocketService, 
    GameRoomService
  ],
  exports: [SocketService],
})
export class SocketModule { }
