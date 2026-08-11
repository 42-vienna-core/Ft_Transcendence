import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminUpdateUserDto } from 'src/admin/dto/admin-update-user.dto';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
      private readonly usersService: UserService,
      private readonly prismaService: PrismaService,
    ) {}

  async searchUsers(query: string) {
    return this.usersService.searchUsers(query ?? '');
  }

  async findOne(id: number) {
    return this.usersService.findOneForAdmin(id);
  }

  async update(id: number, body : AdminUpdateUserDto) {
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    if (body.role === "ADMIN")
      throw new Error();
    return this.prismaService.users.update({
      where: {id,},
      data: body,
    })
  }

  async remove(id: number) {
    return this.usersService.deleteUser(id);
  }

  
}
