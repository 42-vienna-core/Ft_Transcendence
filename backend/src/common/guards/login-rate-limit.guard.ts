// import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
// import { RedisService } from 'src/redis/redis.service';

// @Injectable()
// export class LoginRateLimitGuard implements CanActivate {
//     constructor(
//         private readonly redisService: RedisService
//     ) { }

//     async canActivate(context: ExecutionContext): Promise<boolean> {
//         const req = context.switchToHttp().getRequest();

//         const email = req.body?.email?.toLowerCase()?.trim();
//         const ip = req.ip;

//         if (!email) {
//             throw new UnauthorizedException('Email required');
//         }

//         // 1. check email block
//         const emailBlocked = await this.redisService.isLoginBlocked(email);
//         if (emailBlocked) {
//             throw new UnauthorizedException('Too many attempts. Try later.');
//         }

//         // 2. optional: IP block
//         const ipBlocked = await this.redisService.isIpBlocked?.(ip);
//         if (ipBlocked) {
//             throw new UnauthorizedException('Too many attempts from IP');
//         }

//         return true;
//     }
// }