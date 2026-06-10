import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class SessionService {

    public constructor(
        private readonly prisma: PrismaService,
        private readonly tokenService: TokenService,
        private readonly redisService: RedisService,
    ) { }

    public async createSession(userId: number, refreshToken: string, userAgent?: string, ip?: string) {
        const refreshTokenHash = await this.tokenService.hashRefreshToken(refreshToken);
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
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

    public async rotateSession(sessionId: string, refreshToken: string) {
        const refreshTokenHash = await this.tokenService.hashRefreshToken(refreshToken);
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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
        await this.redisService.addSessionToBlackList(sessionId);
        return result;
    }

    public async deleteAllUserSessions(userId: number) {
        const sessions = await this.prisma.sessions.findMany({
            where: {
                userId,
            },
            select: {
                id: true
            },
        });
        const deletedCount = await this.prisma.sessions.deleteMany({
            where: { userId },
        });

        for (const session of sessions) {
            await this.redisService.addSessionToBlackList(session.id);
        }
        return deletedCount;
    }
}
