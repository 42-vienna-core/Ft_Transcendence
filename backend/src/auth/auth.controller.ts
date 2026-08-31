import { Body, Controller, HttpCode, HttpStatus, Post, Req , Get, UseGuards, Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register.dto';
import type { Request, Response } from 'express';
import { LoginRequest } from './dto/login.dto';
import { Authorization } from '../common/decorators/authorization.decorator';
import { Authorized } from '../common/decorators/authorized.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GoogleAuthGuard } from 'src/common/guards/google-auth.guard';
import { OAuthProfileType } from 'src/common/strategies/google.strategy';

interface RequestWithOAuthProfileType {
    user : OAuthProfileType;
}

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
  public async refresh( @Body('refreshToken') refreshToken: string ) {
    console.log("🟡 refresh")
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  public async logout(@Authorized('sessionId') sessionId: string ) {
    console.log("🟡 logout")
    const count = await this.authService.logout(sessionId);
    return { success: true, count };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  public async logoutAll( @Authorized('userId') userId: number) {
    console.log("🟡 logout-all")
    const count = await this.authService.logoutAll(userId);
    return { success: true, count };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  public async changePassword( @Authorized('userId') userId: number, @Body() dto: ChangePasswordDto) {
    console.log("🟡 change-password")
    return this.authService.changePassword(userId, dto);
  }

  private redirectWithTokens(
    res: Response,
    accessToken: string,
    refreshToken: string,
    user: { id: number; name: string; role: string; avatar: string | null; termsAcceptedAt: Date | null; createdAt: Date },
  ) {
    const redirectUrl = new URL('/api/auth/oauth-callback', process.env.FRONTEND_URL || 'https://localhost');
    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('refreshToken', refreshToken);
    redirectUrl.searchParams.set('id', String(user.id));
    redirectUrl.searchParams.set('name', user.name);
    redirectUrl.searchParams.set('role', user.role);
    if (user.avatar) redirectUrl.searchParams.set('avatar', user.avatar);
    if (user.termsAcceptedAt) redirectUrl.searchParams.set('termsAcceptedAt', user.termsAcceptedAt.toISOString());
    redirectUrl.searchParams.set('createdAt', user.createdAt.toISOString());
    res.redirect(redirectUrl.toString());
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: RequestWithOAuthProfileType, @Res() res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.oauthLogin(req.user);
    this.redirectWithTokens(res, accessToken, refreshToken, user);
  }
}
