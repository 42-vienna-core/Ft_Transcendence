import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "../interfaces/jwt.interface";
// import { RedisService } from "src/redis/redis.service";
import { SessionService } from "src/session/session.service";
import { Sessions } from "@prisma/client";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        readonly configService: ConfigService,
        private readonly sessionService: SessionService,
        // private readonly redisService: RedisService, 
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        });
    }

    async validate(payload: JwtPayload): Promise<Sessions> {
        const session = await this.sessionService.findSessionById(payload.sessionId);
        if (!session) {
            throw new UnauthorizedException("Session not found");
        }
        if (payload.userId !== session.userId) {
            throw new UnauthorizedException();
        }
        return session;
        // const isSessionInBlackList = await this.redisService.isSessionBlacklisted(payload.sessionId);
        // if (isSessionInBlackList) {
        //     throw new UnauthorizedException();
        // }
        // return payload;
    };
}