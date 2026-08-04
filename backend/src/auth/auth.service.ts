import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterRequest } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { SessionService } from '../session/session.service';
import { LoginRequest } from './dto/login.dto';
import { hash, verify } from 'argon2';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly sessionService: SessionService,
        private readonly configService: ConfigService,
        private readonly redis: RedisService
    ) { }

    public async register(dto: RegisterRequest) {
        const email = dto.email.toLowerCase().trim();
        dto.email = email;
        const user = await this.userService.findByEmail(email);

        if (user) {
            throw new ConflictException('User already exists');
        }
        const passwordHash = await hash(dto.password);
        await this.userService.create(dto, passwordHash);
        return { success: true };
    }

    public async login(dto: LoginRequest, userAgent?: string, ip?: string) {
        // TODO REDIS - Rate Limiting
        const email = dto.email.toLowerCase().trim();
        dto.email = email;
        const user = await this.userService.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await verify(user.password, dto.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const refreshToken = await this.tokenService.generateRefreshToken();
        const session = await this.sessionService.createSession(user.id, refreshToken, userAgent, ip);
        const accessToken = await this.tokenService.generateAccessToken(user.id, session.id);
        const avatarsUrl = this.configService.getOrThrow<String>('AVATARS_URL')
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                avatar: user.avatar ? avatarsUrl + user.avatar : null,
                score: user.score,
            }
        };
    }

    public async refresh(refreshToken: string) {
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token missing');
        }
        const tokenHash = await this.tokenService.hashRefreshToken(refreshToken);

        const cacheKey = `refresh:${tokenHash}`;

        const cachedTokens = await this.redis.get(cacheKey);
        if (cachedTokens) {
            console.log("ℹ️ cachedTokens")
            return JSON.parse(cachedTokens) as { accessToken: string; refreshToken: string };
        }

        const lockKey = `lock:refresh:${tokenHash}`;
        const lockId = await this.redis.acquireLock(lockKey, 10);

        if (!lockId) {
            console.log("ℹ️ !lockId")
            const retryCached = await this.redis.waitForCache(cacheKey, 2500);
            if (retryCached) {
                console.log("ℹ️ retryCached")
                return JSON.parse(retryCached) as { accessToken: string; refreshToken: string };
            }
            throw new UnauthorizedException('Concurrent refresh request failed, try again');
        }

        try {
            const session = await this.sessionService.findSessionByHash(tokenHash);
            if (!session) {
                throw new UnauthorizedException('Invalid or expired session');
            }
            const newRefreshToken = await this.tokenService.generateRefreshToken();
            await this.sessionService.rotateSession(session.id, newRefreshToken);
            const accessToken = await this.tokenService.generateAccessToken(session.userId, session.id);

            const tokens = { accessToken, refreshToken: newRefreshToken };

            await this.redis.setEx(cacheKey, 30, JSON.stringify(tokens));
            return tokens;
        } finally {
            if (lockId) {
                console.log("ℹ️ finally releaseLock")
                await this.redis.releaseLock(lockKey, lockId).catch(() => { });
            }
        }
    }

    public async logout(sessionId: string) {
        console.log("logout")
        const count = await this.sessionService.deleteSession(sessionId);
        return count;
    }

    public async logoutAll(userId: number) {
        console.log("logoutAll")
        const count = await this.sessionService.deleteAllUserSessions(userId);
        return count;
    }

    public async changePassword(userId: number, dto: ChangePasswordDto) {
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await verify(user.password, dto.old);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const passwordHash = await hash(dto.new);

        await this.userService.updatePassword(userId, passwordHash);
        await this.sessionService.deleteAllUserSessions(userId);
        return { success: true };
    }
}
