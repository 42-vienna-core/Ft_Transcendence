import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionModule } from '../session/session.module';
import { TokenModule } from '../token/token.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { RedisModule } from 'src/redis/redis.module';
import { GoogleStrategy } from 'src/common/strategies/google.strategy';
import { MailModule } from 'src/mail/mail.modul';

@Module({
  imports: [
    PassportModule,
    PrismaModule,
    UserModule,
    SessionModule,
    TokenModule,
    RedisModule,
    MailModule
  ],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy
  ],
  controllers: [AuthController],
})
export class AuthModule { }
