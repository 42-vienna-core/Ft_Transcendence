import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard'; // Проверь свой путь к гварду

export function Authorization() {
    return applyDecorators(
        UseGuards(JwtAuthGuard),
    );
}
