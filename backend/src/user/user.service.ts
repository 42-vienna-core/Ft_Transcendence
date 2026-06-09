import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RegisterRequest } from '../auth/dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/updata-user.dto';

import { unlink } from 'fs/promises';
import { join } from 'path';
import { fileTypeFromFile } from 'file-type';

export const AVATAR_UPLOAD_DIR = '/uploads/avatars';

@Injectable()
export class UserService {

	public constructor(
		private readonly prismaService: PrismaService,
	) { }

	public async findByEmail(email: string) {
		const user = await this.prismaService.user.findUnique({
			where: { email }
		});
		return user;
	}

	public async findById(id: number) {
		const user = await this.prismaService.user.findUnique({
			where: { id }
		});
		return user;
	}

	public async create(dto: RegisterRequest, passwordHash: string) {
		const user = await this.prismaService.user.create({
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
		await this.prismaService.user.update({
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
	 	await this.prismaService.user.update({
			where: {
				id: userId,
			},
			data: {
				password: passwordHash,
			},
		});
	}

	private async removeFile(filename: string) {
		try {
			const filePath = join(AVATAR_UPLOAD_DIR, filename);
			await unlink(filePath);
		} catch (error: unknown) {
			const err = error as NodeJS.ErrnoException;
			if (err.code !== 'ENOENT') {
				console.error(`Failed to delete avatar: ${filename}`, error);
			}
		}
	}
	
	public async updateAvatar(
		userId: number,
		file: Express.Multer.File,
	) {
		if (!file) {
			throw new BadRequestException('Avatar file is required');
		}
		const allowedMimeTypes = [
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/webp',
		];
		const type = await fileTypeFromFile(file.path);
		if (!type || !allowedMimeTypes.includes(type.mime)) {
			await this.removeFile(file.filename);
			throw new BadRequestException('Invalid image');
		}
		const user = await this.prismaService.user.findUnique({
			where: { id: userId },
		});
		if (!user) {
			await this.removeFile(file.filename);
			throw new NotFoundException('User not found');
		}

		const oldAvatar = user.avatar;
		const avatarPath = file.filename;

		await this.prismaService.user.update({
			where: { id: userId },
			data: {
				avatar: avatarPath,
			},
		});
		if (oldAvatar) {
			await this.removeFile(oldAvatar);
		}
		return {
			success: true,
			avatar: "https://localhost/avatars/" + avatarPath,
		};
	}
}
