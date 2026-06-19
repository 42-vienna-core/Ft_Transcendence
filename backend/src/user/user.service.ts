import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RegisterRequest } from '../auth/dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/updata-user.dto';
import { unlink } from 'fs/promises';
import { basename, join, resolve } from 'path';
import { fileTypeFromFile } from 'file-type';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

export const AVATAR_UPLOAD_DIR = '/uploads/avatars';

@Injectable()
export class UserService {

	public constructor(
		private readonly prismaService: PrismaService ) { }

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

	private async removeFile(filename: string) {
		try {

			const safeName = basename(filename);
			// const filePath = join(AVATAR_UPLOAD_DIR, safeName);

			const baseDir = resolve(AVATAR_UPLOAD_DIR);
			const filePath = resolve(baseDir, safeName);

			if (!filePath.startsWith(baseDir)) {
				throw new Error('Path traversal detected');
			}

			console.log('[FILE][DELETE]', filePath);
			await unlink(filePath);
		} catch (error: any) {
			const err = error as NodeJS.ErrnoException;
			if (err.code !== 'ENOENT') {
				console.error('[FILE][DELETE][ERROR]', err);
			}
		}
	}
	
	public async updateAvatar(
		userId: number,
		file: Express.Multer.File,
	) {
		const MAX_WIDTH = 4096;
		const MAX_HEIGHT = 4096;
		const MAX_PIXELS = 16_000_000;

		console.log('[UPLOAD][START]', {
			userId,
			file: file?.filename,
			size: file?.size,
		});

		if (!file) {
			throw new BadRequestException('Avatar file is required');
		}
		const user = await this.prismaService.users.findUnique({
			where: { id: userId },
		});
		if (!user) {
			await this.removeFile(file.filename);
			throw new NotFoundException('User not found');
		}

		let type;
		try {
			type = await fileTypeFromFile(file.path);
			console.log('[UPLOAD][FILETYPE]', type);
		} catch (err) {
			console.error('[UPLOAD][FILETYPE ERROR]', err);
			await this.removeFile(file.filename);
			throw new BadRequestException('Cannot detect file type');
		}
		if (!type) {
			await this.removeFile(file.filename);
			throw new BadRequestException('Unknown file type');
		}

		if (type.mime === 'image/svg+xml') {
			await this.removeFile(file.filename);
			throw new BadRequestException('SVG is not allowed (XSS protection)');
		}
		const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);

		if (!allowed.has(type.mime)) {
			await this.removeFile(file.filename);
			throw new BadRequestException('Invalid image type');
		}

		let image: sharp.Sharp;
		let metadata: sharp.Metadata;
		
		try {
			image = sharp(file.path, {
				limitInputPixels: MAX_PIXELS,
				failOn: 'error',
				sequentialRead: true,
			});
			metadata = await image.metadata();
			console.log('[UPLOAD][METADATA]', metadata);
		} catch (err) {
			console.error('[UPLOAD][SHARP ERROR]', err);
			await this.removeFile(file.filename);
			throw new BadRequestException('Invalid image');
		}
		if (!metadata.width || !metadata.height) {
			await this.removeFile(file.filename);
			throw new BadRequestException('Cannot read image dimensions');
		}

		const allowedFormats = new Set([
			'jpeg',
			'png',
			'webp',
		]);

		if (!allowedFormats.has(metadata.format ?? '')) {
			await this.removeFile(file.filename);
			throw new BadRequestException('Invalid image format');
		}

		if (
			metadata.width > MAX_WIDTH ||
			metadata.height > MAX_HEIGHT ||
			metadata.width * metadata.height > MAX_PIXELS
		) {
			await this.removeFile(file.filename);
			throw new BadRequestException('Image too large');
		}

		const avatarFilename = `${randomUUID()}.webp`;
		const outputPath = join(AVATAR_UPLOAD_DIR, avatarFilename);

		try {
			await image
				.rotate()
				.resize(200, 200, {
					fit: 'cover',
					withoutEnlargement: true,
				})
				.webp({
					quality: 85,
				})
				.toFile(outputPath);
			
			console.log('[UPLOAD][PROCESSED]', outputPath);

			await this.removeFile(file.filename);
		} catch (error) {
			console.error('[UPLOAD][PROCESS ERROR]', error);

			await this.removeFile(file.filename);
			await this.removeFile(avatarFilename);
			throw new BadRequestException('Failed to process image');
		}
		
		const oldAvatar = user.avatar;

		try {
			await this.prismaService.users.update({
				where: { id: userId },
				data: { avatar: avatarFilename },
			});
		} catch (error) {
			console.error('[DB][UPDATE AVATAR ERROR]', error);

			await this.removeFile(avatarFilename);
			throw error;
		}
		if (oldAvatar) {
			await this.removeFile(oldAvatar);
		}

		console.log('[UPLOAD][DONE]', {
			avatar: avatarFilename,
		});

		return {
			success: true,
			avatar: `https://localhost/avatars/${avatarFilename}`,
		};
	}
}
