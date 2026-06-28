import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUsersDto } from 'src/dto/create-users.dto';
import { LoginUsersDto } from 'src/dto/login-users.dto';
import { Authorization } from './common/decorators/authorization.decorator';
import { Authorized } from './common/decorators/authorized.decorator';
import { ResetPasswordDto } from 'src/dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  
  @Post("me")
  me(@Body('accessToken') accessToken: string) {
    return this.authService.me(accessToken);
  }
  
  @Post('register')
  signUp(@Body() dto: CreateUsersDto) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  signIn(@Body() dto: LoginUsersDto ) {
    return this.authService.signIn(dto);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string ) {
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @Authorization()
  async logout(@Authorized('sessionId') sessionId: string ) {
    const count = await this.authService.logout(sessionId);
    return { success: true, count };
  }

  @Post("reset")
  reset (@Body() body : ResetPasswordDto) {
    return this.authService.reset(body);
  }
  

  @Post('logout-all')
  @Authorization()
  async logoutAll( @Authorized('userId') userId: string ) {
    const count = await this.authService.logoutAll(Number(userId));
    return { success: true, count };
  }
}
