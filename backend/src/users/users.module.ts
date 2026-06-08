import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MailModule } from '../mail/mail.modul';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MailModule
  ],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService, JwtService],
})
export class UserModule { }