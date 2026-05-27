import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register.dto';
import type { Request, Response } from 'express';
import { LoginRequest } from './dto/login.dto';
import { Cookie } from 'src/common/decorators/cookies.decorator';

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
    return await this.authService.register(res, dto, req.headers['user-agent'], req.ip)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() dto: LoginRequest,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.login(res, dto, req.headers['user-agent'], req.ip)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Cookie('refreshToken') token: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.refresh(res, token, req.headers['user-agent'], req.ip);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public async logout(
    @Cookie('refreshToken') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(res, token);
    return { success: true };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  public async logoutAll(
    @Cookie('refreshToken') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(res, token);
    return { success: true };
  }
}
