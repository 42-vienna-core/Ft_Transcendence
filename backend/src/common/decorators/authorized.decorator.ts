import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Authorized = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        // example: @Authorized('userId') - return userId from JwtPayload
        if (data) {
            return user?.[data];
        }

        // example: @Authorized() - return JwtPayload
        return user;
    },
);
