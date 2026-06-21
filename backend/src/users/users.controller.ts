import { Controller, Query, Get, Body, Patch, Param, Delete, ParseIntPipe, ValidationPipe, Ip } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../dto/updata-users.dto';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { LoggerService } from 'src/logger/logger.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  private readonly logger = new LoggerService(UsersController.name);


  @Get("search")
  search() {
    return this.userService.search();
  }
  @Throttle({ long: { ttl: 60000, limit: 5 } })
  // @Post('find')
  // findUser(@Body(ValidationPipe) newPassword: UpdateUserDto) {
  //   return this.userService.findUser(newPassword);
  // }

  // @Post('code')
  // resetCode(@Body(ValidationPipe) code: UpdateUserDto) {
  //   console.log('this is the rout ');
  //   return this.userService.resetCode(code);
  // }

  @Get()
  findAll(@Ip() ip: string, @Query('role') role?: 'ADMIN' | 'PLAYER') {
    this.logger.log(`IP ${ip} requested user list with role filter: ${role}`);
    return this.userService.findAll(role);
  }

  @SkipThrottle()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update( @Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updatedUser: UpdateUserDto ) {
    return this.userService.update(id, updatedUser);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
