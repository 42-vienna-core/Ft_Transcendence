import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';

const {JWT_ACCESS_SECRET, JWT_ACCESS_TTL} = process.env;
const rawAccessTTL = JWT_ACCESS_TTL?.match(/\d+/)?.[0] || '15';
const ACCESS_TOKEN_TTL = Number(rawAccessTTL);

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: JWT_ACCESS_SECRET,
      signOptions: { expiresIn: ACCESS_TOKEN_TTL},
    }),

  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule { }
