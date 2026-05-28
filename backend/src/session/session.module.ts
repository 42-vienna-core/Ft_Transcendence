import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [PrismaModule, TokenModule],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule { }
