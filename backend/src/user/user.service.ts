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
		//   const filePath = join(process.cwd(), 'uploads/avatars', filename);
			const filePath = join(AVATAR_UPLOAD_DIR, filename);
			await unlink(filePath);
		} catch {
		  // игнорируем ошибки удаления (файл может не существовать)
		}
	}
	
	public async updateAvatar(
		userId: number,
		file: Express.Multer.File,
	) {
		// 1. Проверяем, существует ли файл вообще
		if (!file) {
			throw new BadRequestException('Avatar file is required');
		}
		const allowedMimeTypes = [
			'image/jpeg',
			'image/png',
			'image/webp',
		];
		if (!allowedMimeTypes.includes(file.mimetype)) {
			await this.removeFile(file.filename);
			throw new BadRequestException('Invalid image type');
		}
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

		// 4. Сохраняем старый аватар
		const oldAvatar = user.avatar;
		const avatarPath = file.filename;


		// 5. Обновляем пользователя
		await this.prismaService.user.update({
			where: { id: userId },
			data: {
				avatar: avatarPath,
			},
		});

		// 6. Удаляем старый файл (если есть)
		if (oldAvatar) {
			await this.removeFile(oldAvatar);
		}

		return {
			success: true,
			avatar: "https://localhost/avatars/" + avatarPath,
		};
	}
}
