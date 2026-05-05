import { Controller,Query ,Get, Post, Body, Patch, Param, Delete, ParseIntPipe , ValidationPipe} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, CreateLoginDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/updata-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  create(@Body(ValidationPipe) newUser: CreateUserDto) {
    return this.userService.create(newUser);
  }

  @Post("resetPassword")
  resetPassword(@Body(ValidationPipe) newPassword: UpdateUserDto) {
    return this.userService.resetPassword(newPassword);
  }

  @Post('login')
  login(@Body(ValidationPipe) body: CreateLoginDto) {
    return this.userService.login(body);
  }

  @Get()
  findAll(@Query('role') role?: 'ADMIN' | 'PLAYER') {
    return this.userService.findAll(role);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updatedUser: UpdateUserDto) {
    return this.userService.update(id, updatedUser);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
