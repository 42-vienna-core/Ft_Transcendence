import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TokenModule } from './token/token.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { AvatarModule } from './avatar/avatar.module';
import { FriendsModule } from './friends/friends.module';
import { SocketService } from './socket/socket.service';
import { SocketModule } from './socket/socket.module';
import { GameRoomModule } from './gameRoom/gameRoom.module';
import { PrismaModule } from './prisma/prisma.module';
import { GameModule } from './game/game.module';
import { AdminModule } from './admin/admin.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    PrismaModule,
    UserModule,
	  EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3, },
      { name: 'long', ttl: 60000, limit: 100, },
    ]),
    TokenModule,
    AuthModule,
    SocketModule,
    SessionModule,
    AvatarModule,
    GameRoomModule,
    FriendsModule,
	  GameModule,
    AdminModule
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }, SocketService],
})

export class AppModule { }
