import { Injectable, NotFoundException } from '@nestjs/common';
import { RegisterRequest } from '../auth/dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/updata-user.dto';
import { AvatarService } from '../avatar/avatar.service';
import { SessionService } from '../session/session.service';
import { RedisService } from 'src/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from 'src/mail/mail.service';
import { ResetCodeDto } from './dto/reset-code.dto';
import { hash } from 'argon2';
import { BadRequestException } from '@nestjs/common';


@Injectable()
export class UserService {

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly avatarService: AvatarService,
		private readonly sessionService: SessionService,
		private readonly redis: RedisService,
		private readonly configService: ConfigService,
		private readonly mailService : MailService

	) { }

	public async findByEmail(email: string) {
		const user = await this.prismaService.users.findUnique({
			where: { email }
		});
		return user;
	}

	public async findById(id: number) {
		const user = await this.prismaService.users.findUnique({
			where: { id },
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
				color: true,
				role: true,
				// isBot: true,
				// createdAt: true,
				// updatedAt: true,
				// isVerified: true,
			},
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		const avatarsUrl = this.configService.getOrThrow<string>('AVATARS_URL');
		return {
			...user,
			avatar: user.avatar ? avatarsUrl + user.avatar : null,
		};
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

	public async updateColor(userId: number, color:string){
		await this.prismaService.users.update({
			where: { id: userId },
			data: { color: color },
		});
		return {success: true};
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
		const avatarsUrl = this.configService.getOrThrow<string>('AVATARS_URL')
		return Promise.all(
			users.map(async (user) => ({
				...user,
				avatar: user.avatar ? avatarsUrl + user.avatar : null,
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

	// Admin routes // 

	async findOneForAdmin(id: number) {
		return this.prismaService.users.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
			},
		});
	}

	async searchUsers(query: string) {
		const users = await this.prismaService.users.findMany({
			where: {
				OR: [
					{ name: { contains: query, mode: 'insensitive' } },
					{ email: { contains: query, mode: 'insensitive' } },
				],
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				createdAt: true,
			},
		});
		if (users.length > 10) {
			const shuffled = users.sort(() => 0.5 - Math.random());
			return shuffled.slice(0, 10);
		}
		return users;
	}

	async reset(body: ResetPasswordDto)
	{
		
		const user = await this.findByEmail(body.email);
		if (!user)
			throw new NotFoundException(`User with email ${body.email} not found`);
		if (body.ConfirmPassword !== body.password)
    		throw new BadRequestException("Passwords do not match");

        const code = Math.floor(100000 + Math.random() * 900000).toString();

		await this.prismaService.users.update({ 
			where: { id: user.id }, 
			data: { resetCode : code, codeExpire: new Date(Date.now() + 5 * 60 * 100), } 
		});
		await this.mailService.sendResetCode(user.email, code);
		return  { email: user.email, password: body.password };
	}

	async resetCode (body : ResetCodeDto)
	{
		const user = await this.findByEmail(body.email);
		if (!user)
			throw new NotFoundException(`User with Email ${body.email} not found`);
		if(user.resetCode !== body.code)
            throw new Error('Wrong code');

        if (!user.codeExpire || user.codeExpire < new Date())
            throw new Error('Code expired');

		const hashedPassword = await hash(body.password);

		await this.prismaService.users.update({
			where: {id: user.id},
			data: {
				password: hashedPassword,
				resetCode: null,
            	codeExpire: null,
			}
		});
		 
		return {message: "Password changed"}
	}
}
