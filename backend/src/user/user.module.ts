import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MailModule } from '../mail/mail.modul';
import { JwtService } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    MailModule, PrismaModule
  ],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService, JwtService],
})
export class UserModule { }