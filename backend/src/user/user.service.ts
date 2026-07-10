import { Injectable, NotFoundException } from '@nestjs/common';
import { RegisterRequest } from '../auth/dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/updata-user.dto';
import { unlink } from 'fs/promises';
import { basename, join, resolve } from 'path';
import { fileTypeFromFile } from 'file-type';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { AvatarService } from 'src/avatar/avatar.service';

export const AVATAR_UPLOAD_DIR = '/uploads/avatars';

@Injectable()
export class UserService {

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly avatarService: AvatarService,
	) { }

	public async findByEmail(email: string) {
		const user = await this.prismaService.users.findUnique({
			where: { email }
		});
		return user;
	}

	public async findById(id: number) {
		const user = await this.prismaService.users.findUnique({
			where: { id }
		});
		return user;
	}

	public async getUser(id: number) {
		const user = await this.prismaService.users.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				avatar: true,
				createdAt: true,
				updatedAt: true,
				// isVerified: true,
			},
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	public async create(dto: RegisterRequest, passwordHash: string) {
		const user = await this.prismaService.users.create({
			data: {
				name: dto.username,
				email: dto.email,
				password: passwordHash,
			},
			select: {
				id: true,
			},
		});
		return user;
	}

	public async update(userId: number, dto: UpdateUserDto) {
		await this.prismaService.users.update({
			where: {
				id: userId,
			},
			data: {
				name: dto.username,
			},
		});
		return { success: true };
	}

	public async updatePassword(userId: number, passwordHash: string) {
		await this.prismaService.users.update({
			where: {
				id: userId,
			},
			data: {
				password: passwordHash,
			},
		});
	}

	public async updateAvatar(userId: number, file: Express.Multer.File) {
		return this.avatarService.updateAvatar(userId, file);
	}

	public async deleteAvatar(userId: number) {
		return this.avatarService.deleteAvatar(userId);
	}

	public async findUsers(name: string) {
		if (!name || !name.trim()) {
  		  return [];
  		}
		const users = await this.prismaService.users.findMany({
			where: {
				name: {
					contains: name,
					mode: 'insensitive',
				},
			},
			select: {
				id: true,
				name: true,
				avatar: true,
			},
		});
		return users;
	}

	public async deleteUser(userId: number) {
		await this.avatarService.deleteAvatar(userId);
		await this.prismaService.users.delete({
			where: {
				id: userId,
			},
		});
		return { success: true };
	}
}
