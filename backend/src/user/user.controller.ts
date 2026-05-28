import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { Authorized } from 'src/common/decorators/authorized.decorator';

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) { }

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Get('me')
  public async findProfile(@Authorized('userId') userId: number) {
    return this.userService.findById(userId);
  }
}

// private readonly logger = new LoggerService(UserController.name);

// @Throttle({ "long": { ttl: 60000, limit: 5 } })
// @Post('register')
// create(@Body(ValidationPipe) newUser: CreateUserDto) {
//   return this.userService.create(newUser);
// }

// @Post("find")
// findUser(@Body(ValidationPipe) newPassword: UpdateUserDto) {
//   return this.userService.findUser(newPassword);
// }

// @Post("code")
// resetCode(@Body(ValidationPipe) code: UpdateUserDto) {
//   return this.userService.resetCode(code);
// }

// @Post('login')
// login(@Body(ValidationPipe) body: CreateLoginDto) {
//   return this.userService.login(body);
// }

// @UseGuards(JwtAuthGuard)
// @Get('profile')
// getProfile(@Req() req: Request) {
//   return this.userService.getProfile(req);
// }

// @Get()
// findAll(@Ip() ip: string, @Query('role') role?: 'ADMIN' | 'PLAYER') {
//   this.logger.log(`IP ${ip} requested user list with role filter: ${role}`);
//   return this.userService.findAll(role);
// }

// @SkipThrottle()
// @Get(':id')
// findOne(@Param('id', ParseIntPipe) id: number) {
//   return this.userService.findOne(id);
// }

// @Patch(':id')
// update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updatedUser: UpdateUserDto) {
//   return this.userService.update(id, updatedUser);
// }

// @Delete(':id')
// remove(@Param('id', ParseIntPipe) id: number) {
//   return this.userService.remove(id);
// }
