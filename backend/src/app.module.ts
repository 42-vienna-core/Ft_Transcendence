import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from  './user/user.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule,  ThrottlerGuard} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from './logger/logger.module';
import { RoomModule } from './room/room.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    UserModule, 
    DatabaseModule, 
    ConfigModule.forRoot({ isGlobal: true, }),
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 1000,
      limit: 3,
    },
    {
      name: 'long',
      ttl: 60000,
      limit: 100,
    }
  ]),
    LoggerModule,
    RoomModule,
    RedisModule
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }],
})

export class AppModule {}
