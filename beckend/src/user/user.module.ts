import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from '../database/database.module';
import { MailModule } from './mail/mail.modul';

@Module({
  imports: [
    DatabaseModule,
    MailModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}