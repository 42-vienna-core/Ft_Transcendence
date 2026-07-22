import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { StringValue } from 'ms';
import { JwtPayload } from 'src/common/interfaces/jwt.interface';

@Injectable()
export class TokenService {
    public constructor(
        private readonly jwt: JwtService,
        private readonly config: ConfigService
    ) { }

    public async verifyAccessToken(token: string): Promise<JwtPayload> {
        return this.jwt.verifyAsync(token, {
            secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        });
    }

    public async generateAccessToken(userId: number, sessionId: string): Promise<string> {
        const accessToken = await this.jwt.signAsync(
            {
                userId: userId,
                sessionId: sessionId,
            },
            {
                secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
                expiresIn: this.config.getOrThrow<StringValue>('JWT_ACCESS_TTL'),
            },
        );
        return accessToken
    }

    public async generateRefreshToken(): Promise<string> {
        return randomBytes(64).toString('base64url')
    }

    public async hashRefreshToken(token: string): Promise<string> {
        return createHash('sha256').update(token).digest('hex')
    }
}