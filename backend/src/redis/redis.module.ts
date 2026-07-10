import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { PrismaModule } from 'src/prisma/prisma.module';

//@Global()
@Module({
  providers: [RedisService, PrismaModule],
  exports: [RedisService],
})
export class RedisModule {}
