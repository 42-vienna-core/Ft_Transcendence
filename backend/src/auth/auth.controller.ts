import { Body, Controller, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUsersDto } from 'src/dto/create-users.dto';
import { LoginUsersDto } from 'src/dto/login-users.dto';
import { Authorization } from './common/decorators/authorization.decorator';
import { Authorized } from './common/decorators/authorized.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  
  @Get('me')
  @Authorization()
  async findMe( @Authorized('userId') userId: number ) {
      return this.authService.findMe(userId);
  }

  @Post('register')
  async signUp(@Body() dto: CreateUsersDto) {
    return await this.authService.signUp(dto);
  }

  @Post('login')
  async signIn(@Body() dto: LoginUsersDto ) {
    return await this.authService.signIn(dto);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string ) {
    return await this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @Authorization()
  async logout(@Authorized('sessionId') sessionId: string ) {
    const count = await this.authService.logout(sessionId);
    return { success: true, count };
  }

  @Post('logout-all')
  @Authorization()
  async logoutAll( @Authorized('userId') userId: string ) {
    const count = await this.authService.logoutAll(Number(userId));
    return { success: true, count };
  }
}
