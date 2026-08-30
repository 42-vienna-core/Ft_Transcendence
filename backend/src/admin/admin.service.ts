import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminUpdateUserDto } from 'src/admin/dto/admin-update-user.dto';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@Injectable()
export class AdminService {
  constructor(
      private readonly usersService: UserService,
      private readonly prismaService: PrismaService,
    ) {}

  async searchUsers(query: string) {
    const q = (query ?? '').trim();

    return this.prismaService.users.findMany({
      where: {
        role: { not: "BOT" },
        ...(q && {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        }),
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async findOne(id: number) {
    return this.usersService.findOneForAdmin(id);
  }

  async update(id: number, body : AdminUpdateUserDto) {
    const user = await this.usersService.findById(id);
    if (!user || user.role === "ADMIN")
      throw new ForbiddenException('Cannot update admin');
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    return this.prismaService.users.update({ where: {id,}, data: body })
  }

  async remove(id: number) {
    const user = await this.usersService.findById(id);
    if (!user)
        throw new NotFoundException("Not found")
    if (user.role === "ADMIN")
        throw new ForbiddenException('Cannot delete admin');
    return this.usersService.deleteUser(id);
  }
  
}
