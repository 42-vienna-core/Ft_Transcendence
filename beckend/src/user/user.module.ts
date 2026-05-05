import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from '../database/database.module';
import { MailService } from './mail/mail.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService, MailService],
})
export class UserModule {}
