import { Controller, Get, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe, } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from 'src/admin/guards/admin.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AdminUpdateUserDto } from 'src/admin/dto/admin-update-user.dto';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  searchUsers(@Query('q') q: string) {
    console.log("???????????????????????????????????? Admin in server: get all ");
    return this.adminService.searchUsers(q);
  }

  @Get('users/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
        console.log("????????????????????????????????????Admin in server: Get/id");

    console.log("Admin in users/:id route id :", id);
    return this.adminService.findOne(id);
  }

  @Put('users/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: AdminUpdateUserDto) {
    console.log("????????????????????????????????????Admin in server: Put");

    return this.adminService.update(id, body);
  }

  @Delete('users/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
      console.log("????????????????????????????????????Admin in server: Delete");

    console.log("Admin in users/:id delete route id :", id);
    return this.adminService.remove(id);
  }
}
