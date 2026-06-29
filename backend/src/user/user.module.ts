import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MailModule } from '../mail/mail.modul';
import { JwtService } from '@nestjs/jwt';
import { AvatarModule } from 'src/avatar/avatar.module';

@Module({
  imports: [
    MailModule,
    AvatarModule,
  ],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService, JwtService],
})
export class UserModule { }