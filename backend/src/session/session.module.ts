import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [PrismaModule, TokenModule, RedisModule],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule { }
