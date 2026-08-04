import { Injectable, NotFoundException } from '@nestjs/common';
import { RegisterRequest } from '../auth/dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/updata-user.dto';
import { AvatarService } from '../avatar/avatar.service';
import { SessionService } from '../session/session.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UserService {

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly avatarService: AvatarService,
		private readonly sessionService: SessionService,
		private readonly redis: RedisService,
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
		console.log("~~~~~~~~~~~~~~~~~~~~ getUser me");
		const user = await this.prismaService.users.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				avatar: true,
				score: true,
				// isBot: true,
				// createdAt: true,
				// updatedAt: true,
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

	public async findUsers(userId: number, name: string) {
		if (!name || !name.trim()) {
			return [];
		}
		const users = await this.prismaService.users.findMany({
			where: {
				id: {
					not: userId,
				},
				name: {
					contains: name,
					mode: 'insensitive',
				},
				isBot: false,
			},
			select: {
				id: true,
				name: true,
				avatar: true,
				score: true,
			},
		});
		for (const user of users) {
			const isOnline = await this.redis.isOnline(user.id);
			console.log("isOnline", user.id, isOnline);
			(user as any).isOnline = isOnline;
		}

		// return users;
		const ids = users.map(u => u.id);
		const requests = await this.prismaService.friendsRequest.findMany({
			where: {
				OR: [
					{
						senderId: userId,
						receiverId: {
							in: ids,
						},
					},
					{
						receiverId: userId,
						senderId: {
							in: ids,
						},
					},
				],
			},
		});

		const map = new Map<number, string>();
		for (const req of requests) {
			const otherId = req.senderId === userId ? req.receiverId : req.senderId;
			if (req.status === 'ACCEPTED') {
				map.set(otherId, 'FRIEND');
			}
			if (req.status === 'PENDING') {
				if (req.senderId === userId)
					map.set(otherId, 'OUTGOING');
				else
					map.set(otherId, 'INCOMING');
			}
		}
		return Promise.all(
			users.map(async (user) => ({
				...user,
				isOnline: await this.redis.isOnline(user.id),
				friendStatus: map.get(user.id) ?? 'NONE',
			})),
		);
	}

	public async deleteUser(userId: number) {
		console.log('Deleting user with ID:', userId);
		await this.avatarService.deleteAvatar(userId);
		await this.sessionService.deleteAllUserSessions(userId);
		await this.prismaService.users.delete({
			where: {
				id: userId,
			},
		});
		console.log('User deleted successfully');
		return { success: true };
	}
}
