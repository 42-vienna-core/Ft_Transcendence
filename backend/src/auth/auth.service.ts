import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterRequest } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { SessionService } from '../session/session.service';
import type { Response } from 'express';
import { LoginRequest } from './dto/login.dto';
import { verify } from 'argon2';

@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly sessionService: SessionService,
    ) { }

    public async register(res: Response, dto: RegisterRequest, userAgent?: string, ip?: string) {
        // TODO REDIS - Rate Limiting
        const email = dto.email.toLowerCase().trim();
        dto.email = email;
        const user = await this.userService.findByEmail(email);

        if (user) {
            throw new ConflictException('User already exists');
        }

        const newUser = await this.userService.create(dto);
        const refreshToken = await this.tokenService.generateRefreshToken();
        const session = await this.sessionService.createSession(newUser.id, refreshToken, userAgent, ip);
        const accessToken = await this.tokenService.generateAccessToken(newUser.id, session.id);

        this.setRefreshCookie(res, refreshToken);
        return { accessToken, refreshToken };
    }

    public async login(res: Response, dto: LoginRequest, userAgent?: string, ip?: string) {
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
        this.setRefreshCookie(res, refreshToken);
        return { accessToken, refreshToken, user: {id: user.id, nama: user.name} };
    }

    public async refresh(res: Response, refreshToken: string) {

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token missing');
        }
        const tokenHash = await this.tokenService.hashRefreshToken(refreshToken);
        const session = await this.sessionService.findSessionByHash(tokenHash);
        if (!session) {
            throw new UnauthorizedException('Invalid or expired session');
        }
        const newRefreshToken = await this.tokenService.generateRefreshToken();

        await this.sessionService.rotateSession(session.id, newRefreshToken);
        const accessToken = await this.tokenService.generateAccessToken(session.userId, session.id);
        this.setRefreshCookie(res, newRefreshToken);
        return { accessToken };
    }

    public async logout(res: Response, sessionId: string) {
        const count = await this.sessionService.deleteSession(sessionId);
        //redis - delete session
        this.clearRefreshCookie(res);
        return count;
    }

    public async logoutAll(res: Response, userId: number) {

        //todo redis - delete all user sessions
        const count = await this.sessionService.deleteAllUserSessions(userId);
        this.clearRefreshCookie(res);
        return count;
    }

    private setRefreshCookie(
        res: Response,
        refreshToken: string
    ) {
        res.cookie(
            'refreshToken',
            refreshToken,
            {
                httpOnly: true,
                sameSite: 'strict',
                secure: true,
                path: '/api/auth',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            },
        );
    }

    private clearRefreshCookie(res: Response) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
            path: '/api/auth',
        });
    }
}
