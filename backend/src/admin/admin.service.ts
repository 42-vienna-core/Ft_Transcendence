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

    if (query === '')
      return this.usersService.searchUsers(query ?? '');
    const users = await this.prismaService.users.findMany();
    return users.filter((item) => item.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  }

  async findOne(id: number) {
    return this.usersService.findOneForAdmin(id);
  }

  async update(id: number, body : AdminUpdateUserDto) {
    const user = await this.usersService.findById(id);
    if (!user || user.role === "ADMIN")
        throw new Error();
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    return this.prismaService.users.update({ where: {id,}, data: body })
  }

  async remove(id: number) {
    return this.usersService.deleteUser(id);
  }
  
}
