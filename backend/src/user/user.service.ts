import { Injectable } from '@nestjs/common';
import { RegisterRequest } from '../auth/dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/updata-user.dto';
import { AvatarService } from 'src/avatar/avatar.service';

export const AVATAR_UPLOAD_DIR = '/uploads/avatars';

@Injectable()
export class UserService {

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly avatarService: AvatarService,
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

	public async getUser(id: number) {
		const user = await this.prismaService.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				avatar: true,
				createdAt: true,
				updatedAt: true,
				isVerified: true,
			},
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

	public async updateAvatar(
		userId: number,
		file: Express.Multer.File,
	) {
		return await this.avatarService.updateAvatar(userId, file);
	}
}
