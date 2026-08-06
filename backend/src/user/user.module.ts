import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MailModule } from '../mail/mail.modul';
import { AvatarModule } from 'src/avatar/avatar.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SessionModule } from 'src/session/session.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    MailModule,
    AvatarModule,
    PrismaModule,
    SessionModule,
    RedisModule,
  ],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }