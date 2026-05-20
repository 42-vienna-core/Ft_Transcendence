import { Controller,Query ,Get, Post, Body, Patch, Param, Delete, ParseIntPipe , ValidationPipe, Req, UseGuards, Ip} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, CreateLoginDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/updata-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { LoggerService } from 'src/logger/logger.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }
  private readonly logger = new LoggerService(UserController.name);

  @Throttle({ "long": { ttl: 60000, limit: 5 } })
  @Post('register')
  create(@Body(ValidationPipe) newUser: CreateUserDto) {
    return this.userService.create(newUser);
  }

  @Post("find")
  findUser(@Body(ValidationPipe) newPassword: UpdateUserDto) {
    return this.userService.findUser(newPassword);
  }

  @Post("code")
  resetCode(@Body(ValidationPipe) code: UpdateUserDto) {
    console.log("this is the rout ")
    return this.userService.resetCode(code);
  }
  
  
  @Post('login')
  login(@Body(ValidationPipe) body: CreateLoginDto) {
    return this.userService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request)  {
    return this.userService.getProfile(req);
  }

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
  update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updatedUser: UpdateUserDto) {
    return this.userService.update(id, updatedUser);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
