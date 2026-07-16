import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MailModule } from '../mail/mail.modul';
import { JwtService } from '@nestjs/jwt';
import { AvatarModule } from 'src/avatar/avatar.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokenModule } from 'src/token/token.module';
import { SessionModule } from 'src/session/session.module';

@Module({
  imports: [
    MailModule,
    AvatarModule,
    PrismaModule,
    TokenModule,
    SessionModule,
  ],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService, JwtService],
})
export class UserModule { }