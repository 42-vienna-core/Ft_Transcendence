import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../database/database.module';
import { MailModule } from '../mail/mail.modul';
import { PassportModule } from '@nestjs/passport';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    PassportModule,
    DatabaseModule,
    MailModule,
    RedisModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
