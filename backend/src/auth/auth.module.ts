import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionModule } from '../session/session.module';
import { TokenModule } from '../token/token.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getJwtConfig } from '../common/configs/jwt.config';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    PrismaModule,
    UserModule, SessionModule, TokenModule, RedisModule],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule { }
