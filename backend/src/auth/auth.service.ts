import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterRequest } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { SessionService } from '../session/session.service';
import { LoginRequest } from './dto/login.dto';
import { hash, verify } from 'argon2';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly sessionService: SessionService,
        private readonly configService: ConfigService,
    ) { }

    async getUserFromAccessToken(accessToken: string) {
        const payload = await this.tokenService.verifyAccessToken(accessToken);
        if (payload)
        {
            try {
                const user =  await this.userService.findById(payload.userId);
                if (!user)
                    throw new NotFoundException("User not found");
                return user;

            }
            catch {console.log("wrong id")}
        }
        return payload;
    }

    public async register(dto: RegisterRequest) {
        const email = dto.email.toLowerCase().trim();
        dto.email = email;
        const user = await this.userService.findByEmail(email);

        if (user) {
            throw new ConflictException('User already exists');
        }
        const passwordHash = await hash(dto.password);
        await this.userService.create(dto, passwordHash);
        // const newUser = await this.userService.create(dto, passwordHash);
        // const refreshToken = await this.tokenService.generateRefreshToken();
        // const session = await this.sessionService.createSession(newUser.id, refreshToken, userAgent, ip);
        // const accessToken = await this.tokenService.generateAccessToken(newUser.id, session.id);
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
                //todo: points? friends?
            }
        };
    }

    public async refresh(refreshToken: string) {
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
        return { accessToken, refreshToken: newRefreshToken };
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
