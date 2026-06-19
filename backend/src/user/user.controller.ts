import { Body, Controller, Delete, Get, HttpCode, HttpStatus, MaxFileSizeValidator, ParseFilePipe, Patch, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { Authorization } from '../common/decorators/authorization.decorator';
import { Authorized } from '../common/decorators/authorized.decorator';
import { UpdateUserDto } from './dto/updata-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { avatarMulterOptions } from '../common/multer/avatar.multer';

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) { }

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Get('me')
  public async findProfile(@Authorized('userId') userId: number) {
    return this.userService.findById(userId);
  }

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Patch('me')
  public async updateUser(
    @Authorized('userId') userId: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(
      userId,
      dto,
    );
  }

  @Patch('me/avatar')
  @Authorization()
  @UseInterceptors(FileInterceptor('file', avatarMulterOptions))
  @HttpCode(HttpStatus.OK)
  public async updateAvatar(
    @Authorized('userId') userId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2 * 1024 * 1024,
          }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    return this.userService.updateAvatar(userId, file);
  }

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Delete('me/avatar')
  public async deletaAvatar(
    @Authorized('userId') userId: number,
  ) {
    void userId;
    return { success: false };
  }
  @Get() 
  async find() {
    return " hello this is user";
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
