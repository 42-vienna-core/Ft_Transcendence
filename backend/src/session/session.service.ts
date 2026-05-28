import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class SessionService {

    public constructor(
        private readonly prisma: PrismaService,
        private readonly tokenService: TokenService,

    ) { }

    public async createSession(userId: number, refreshToken: string, userAgent?: string, ip?: string) {
        const refreshTokenHash = await this.tokenService.hashRefreshToken(refreshToken)
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        const session = await this.prisma.session.create({
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
        })
        return session
    }

    public async findSessionByHash(tokenHash: string) {
        const session = await this.prisma.session.findFirst({
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

        const refreshTokenHash = await this.tokenService.hashRefreshToken(refreshToken)
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        return this.prisma.session.update({
            where: {
                id: sessionId,
            },
            data: {
                refreshTokenHash,
                expiresAt,
            }
        })
    }

    public async deleteSession(sessionId: string) {
        return this.prisma.session.deleteMany({
            where: {
                id: sessionId,
            },
        })
    }

    public async deleteAllUserSessions(userId: number) {
        return this.prisma.session.deleteMany({
            where: {
                userId,
            },
        })
    }
}


// public async revokeSession(sessionId: string) {
//     return await this.prisma.session.update({
//         where: { id: sessionId },
//         data: {
//             revokedAt: new Date(),
//         },
//     })
// }

// public async revokeAllUserSessions(userId: number) {
//     return this.prisma.session.updateMany({
//         where: {
//             userId,
//             revokedAt: null,
//         },
//         data: {
//             revokedAt: new Date(),
//         },
//     });
// }

// public async findAllSessions(userId: number) {
//     const sessions = await this.prisma.session.findMany({
//         where: {
//             userId,
//             revokedAt: null,
//             expiresAt: {
//                 gt: new Date(),
//             },
//         },
//     })
//     return sessions;
// }
