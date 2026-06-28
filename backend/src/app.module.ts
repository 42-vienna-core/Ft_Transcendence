import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
// import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
// import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from './logger/logger.module';
import { GameRoomModule } from './gameRoom/gameRoom.module';
import { RedisModule } from './redis/redis.module';
import { SocketService } from './socket/socket.service';
import { SocketModule } from './socket/socket.module';
import { FriendModule } from './friend/friend.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    ConfigModule.forRoot( {  isGlobal: true, } ),
    // ThrottlerModule.forRoot([
    //   {
    //     name: 'short',
    //     ttl: 1000,
    //     limit: 3,
    //   },
    //   {
    //     name: 'long',
    //     ttl: 60000,
    //     limit: 100,
    //   },
    // ]),
    LoggerModule,
    GameRoomModule,
    RedisModule,
    SocketModule,
    FriendModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [ AppService,  SocketService,],// { provide: APP_GUARD, useClass: ThrottlerGuard },
})
export class AppModule {}
