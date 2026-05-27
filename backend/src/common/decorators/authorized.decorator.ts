import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Authorized = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user; // Сюда Passport складывает то, что вернул метод validate()

        // Если запросили конкретное поле (например, @Authorized('userId'))
        if (data) {
            return user?.[data];
        }

        // Иначе возвращаем весь объект пользователя/payload
        return user;
    },
);