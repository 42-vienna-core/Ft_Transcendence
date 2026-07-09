
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUsersDto } from 'src/dto/create-users.dto';
import { UsersService } from 'src/users/users.service';
import { TokenService } from './token/token.service';
import { SessionService } from './session/session.service';
import { LoginUsersDto } from 'src/dto/login-users.dto';
import { DatabaseService } from 'src/database/database.service';
import  * as bcrypt from "bcrypt"
import { ResetPasswordDto } from 'src/dto/reset-password.dto';

@Injectable()
export class AuthService {

    constructor(
        private readonly dbService:         DatabaseService,
        private readonly usersService:      UsersService,
        private readonly tokenService:      TokenService,
        private readonly sessionService:    SessionService,
    ) { }

    async me(accessToken: string) {
        const payload = await this.tokenService.verifyAccessToken(accessToken);
        if (payload)
        {
            try {
                const userData = await this.usersService.findOne(payload.userId);
                return userData
            }
            catch {console.log("wrong id")}
        }
        return payload;
    }

    async signUp(body: CreateUsersDto) {

        const	hashedPassword = await bcrypt.hash(body.Password, 10);
		const	newBody = {
			...body,
			Password: hashedPassword
		}
        const newUser = await this.usersService.create(newBody);
        if (!newUser) {
            throw new ConflictException('User already exists');
        }
        const accessToken = await this.createTokenSession(newUser.id);
         return {...accessToken};
    }

    async signIn(body: LoginUsersDto) {
        
        // TODO REDIS - Rate Limiting
        const user = await this.dbService.users.findUnique( { where: { Email: body.Email } } );
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(body.Password, user.Password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const accessToken = await this.createTokenSession(user.id);
        return {...accessToken};
    }

    async reset(body: ResetPasswordDto) {
        const user = await this.dbService.users.findUnique({where: {Email: body.Email}});
        if (!user)
            throw new UnauthorizedException();
        const newPassword = await bcrypt.hash(body.Password, 10);
        const updatedUser = await this.usersService.update(user.id, { Password: newPassword });
        if (!updatedUser)
            throw new UnauthorizedException('Invalid credentials');
        const tokens = await this.createTokenSession(user.id);
        return tokens;
    }

    async refresh(refreshToken: string) {

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

    async logout(sessionId: string) {
        const count = await this.sessionService.deleteSession(sessionId);
        return count;
    }

    async logoutAll(userId: number) {
        const count = await this.sessionService.deleteAllUserSessions(userId);
        return count;
    }
    
    async createTokenSession(userId: number) {
        const refreshToken = await this.tokenService.generateRefreshToken();
        const session = await this.sessionService.createSession(userId, refreshToken);
        const accessToken = await this.tokenService.generateAccessToken(userId, session.id);
        return { accessToken, refreshToken };
    }
}
