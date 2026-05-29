import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register.dto';
import type { Request, Response } from 'express';
import { LoginRequest } from './dto/login.dto';
import { Authorization } from '../common/decorators/authorization.decorator';
import { Authorized } from '../common/decorators/authorized.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async register(
    @Body() dto: RegisterRequest,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log("Registration", dto)
    return await this.authService.register(res, dto, req.headers['user-agent'], req.ip);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() dto: LoginRequest,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log("Login", dto)
    return await this.authService.login(res, dto, req.headers['user-agent'], req.ip);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Body('refreshToken') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.refresh(res, token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  public async logout(
    @Authorized('sessionId') sessionId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const count = await this.authService.logout(res, sessionId);
    return { success: true, count };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  public async logoutAll(
    @Authorized('userId') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const count = await this.authService.logoutAll(res, Number(userId));
    return { success: true, count };
  }
}
