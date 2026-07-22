import { Body, Controller, Delete, Get, HttpCode, HttpStatus, MaxFileSizeValidator, Query, ParseFilePipe, Patch, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { Authorization } from '../common/decorators/authorization.decorator';
import { Authorized } from '../common/decorators/authorized.decorator';
import { UpdateUserDto } from './dto/updata-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { avatarMulterOptions } from '../common/multer/avatar.multer';
import { SearchUserDto } from './dto/search-user.dto';

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
  @HttpCode(HttpStatus.OK)
  public async searchUsers(
    @Query() query: SearchUserDto,
  ) {
    return this.userService.findUsers(query.name);
  }

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Delete('me')
  public async deleteUser(
    @Authorized('userId') userId: number,
  ) {
    return this.userService.deleteUser(userId);
  }
}