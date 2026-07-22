import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register.dto';
import type { Request } from 'express';
import { LoginRequest } from './dto/login.dto';
import { Authorization } from '../common/decorators/authorization.decorator';
import { Authorized } from '../common/decorators/authorized.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async register(
    @Body() dto: RegisterRequest,
  ) {
    console.log("🟡 register")
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() dto: LoginRequest,
    @Req() req: Request,
  ) {
    console.log("🟡 login")
    return this.authService.login(dto, req.headers['user-agent'], req.ip);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Body('refreshToken') refreshToken: string,
  ) {
    console.log("🟡 refresh")
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  public async logout(
    @Authorized('sessionId') sessionId: string,
  ) {
    console.log("🟡 logout")
    const count = await this.authService.logout(sessionId);
    return { success: true, count };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  public async logoutAll(
    @Authorized('userId') userId: number,
  ) {
    console.log("🟡 logout-all")
    const count = await this.authService.logoutAll(userId);
    return { success: true, count };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  public async changePassword(
    @Authorized('userId') userId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    console.log("🟡 change-password")
    return this.authService.changePassword(userId, dto);
  }
}
