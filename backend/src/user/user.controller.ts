import { Body, Controller, Delete, Get, Post, HttpCode, HttpStatus, MaxFileSizeValidator, Query, ParseFilePipe, Patch, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService, type Leaderboard } from './user.service';
import { Authorization } from '../common/decorators/authorization.decorator';
import { Authorized } from '../common/decorators/authorized.decorator';
import { UpdateUserDto } from './dto/updata-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { avatarMulterOptions } from '../common/multer/avatar.multer';
import { SearchUserDto } from './dto/search-user.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetCodeDto } from './dto/reset-code.dto';

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) { }

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Get('me')
  public async findProfile(@Authorized('userId') userId: number) {
    return this.userService.getUser(userId);
  }

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Patch('me')
  public async updateUser(
    @Authorized('userId') userId: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(userId, dto);
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
    return this.userService.deleteAvatar(userId);
  }

  @Get('search')
  @Authorization()
  @HttpCode(HttpStatus.OK)
  public async searchUsers(
    @Query() query: SearchUserDto,
    @Authorized('userId') userId: number,
  ) {
    return this.userService.findUsers(userId, query.name);
  }

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Delete('me')
  public async deleteUser(
    @Authorized('userId') userId: number,
  ) {
    return this.userService.deleteUser(userId);
  }

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Patch('me/color')
  public async UpdateColor(@Authorized('userId') userId: number, @Body() dto: UpdateColorDto){
	return this.userService.updateColor(userId, dto.color);
  }

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Patch('me/terms')
  public async acceptTerms(@Authorized('userId') userId: number) {
    return this.userService.acceptTerms(userId);
  }
  
  @Post("resetCode")
  async resetCode(@Body() body: ResetCodeDto)
  {
    return this.userService.resetCode(body);
  }
    
  @Post("reset")
  async reset(@Body() body: ResetPasswordDto)
  {
    return await this.userService.reset(body);
  }

  @Get('leaderboard')
  @Authorization()
  getLeaderboard(): Promise<Leaderboard[]>{
	  return this.userService.getLeaderboard();
  }
}