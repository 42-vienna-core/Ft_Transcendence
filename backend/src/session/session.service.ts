import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../token/token.service';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';

@Injectable()
export class SessionService {

    private readonly refreshTtlMs: number;

    public constructor(
        private readonly prisma: PrismaService,
        private readonly tokenService: TokenService,
        private readonly configService: ConfigService,

    ) {
        this.refreshTtlMs = ms(this.configService.getOrThrow<StringValue>('JWT_REFRESH_TTL'));
    }

    public async createSession(userId: number, refreshToken: string, userAgent?: string, ip?: string) {
        const refreshTokenHash = await this.tokenService.hashRefreshToken(refreshToken);
        const expiresAt = new Date(Date.now() + this.refreshTtlMs);
        const session = await this.prisma.sessions.create({
            data: {
                userId: userId,
                refreshTokenHash: refreshTokenHash,
                userAgent: userAgent,
                ip: ip,
                expiresAt: expiresAt,
            },
            select: {
                id: true,
                expiresAt: true,
            },
        });
        return session;
    }

    public async findSessionByHash(tokenHash: string) {
        const session = await this.prisma.sessions.findFirst({
            where: {
                refreshTokenHash: tokenHash,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
        return session;
    }

    public async findSessionById(id: string) {
        const session = await this.prisma.sessions.findFirst({
            where: {
                id: id,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
        return session;
    }

    public async rotateSession(sessionId: string, refreshToken: string) {
        const refreshTokenHash = await this.tokenService.hashRefreshToken(refreshToken);
        const expiresAt = new Date(Date.now() + this.refreshTtlMs);
        return this.prisma.sessions.update({
            where: {
                id: sessionId,
            },
            data: {
                refreshTokenHash,
                expiresAt,
            }
        });
    }

    public async deleteSession(sessionId: string) {
        const result = await this.prisma.sessions.deleteMany({
            where: {
                id: sessionId,
            },
        });
        return result;
    }

    public async deleteAllUserSessions(userId: number) {
        const deletedCount = await this.prisma.sessions.deleteMany({
            where: { userId },
        });
        return deletedCount;
    }
}
