import { Injectable, NotFoundException, GoneException } from '@nestjs/common';
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
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

export interface Leaderboard{
	id: number,
	name: string,
	avatar: string | null,
	score: number,
	level: number,
	createdAt: Date,
	rank: number,
	totMatches: number,
}

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

	async startPasswordReset (id : number, body : {email: string, password: string}) {
		const code = Math.floor(100000 + Math.random() * 900000).toString();
		const pendingPassword = await hash(body.password);

		await this.prismaService.users.update({ 
			where: { id },
			data: {
				pendingPassword,
				resetCode : code,
				codeExpire: new Date(Date.now() + 5 * 60 * 1000),
				resetCodeAttempts: 0,
			}
		});
		await this.mailService.sendResetCode(body.email, code);
		return  { email: body.email};
	}

	async reset(body: ResetPasswordDto)
	{
		if (body.ConfirmPassword !== body.password)
    		throw new BadRequestException(`Passwords do not match`);
		const user = await this.findByEmail(body.email);
		if (!user)
			return { email: body.email };

		return await this.startPasswordReset(user.id, {email: body.email, password: body.password});
	}

	async resetCode (body : ResetCodeDto)
	{
		const MAX_CODE_ATTEMPTS = 5;

		const user = await this.findByEmail(body.email);
		if (!user)
			throw new NotFoundException(`Passwords do not match`);

		if (!user.resetCode || !user.codeExpire || user.codeExpire < new Date())
			throw new GoneException('Code expired');
		if (!user.pendingPassword)
			throw new BadRequestException("NO pending password change");

		if (user.resetCodeAttempts >= MAX_CODE_ATTEMPTS) {
			await this.prismaService.users.update({
				where: { id: user.id },
				data: { resetCode: null, codeExpire: null, pendingPassword: null, resetCodeAttempts: 0 },
			});
			throw new UnauthorizedException('Too many wrong attempts, request a new code');
		}

		if (user.resetCode !== body.code) {
			await this.prismaService.users.update({
				where: { id: user.id },
				data: { resetCodeAttempts: { increment: 1 } },
			});
			throw new UnauthorizedException('Wrong code');
		}

		await this.prismaService.users.update({
			where: {id: user.id},
			data: {
				password: user.pendingPassword,
				pendingPassword : null,
				resetCode: null,
            	codeExpire: null,
				resetCodeAttempts: 0,
			}
		});
		 
		return {message: "Password changed"}
	}

	async getLeaderboard(): Promise<Leaderboard[]> {
		const data = await this.prismaService.users.findMany({
			where: {isBot: false},
			select: {
				id: true,
				name: true,
				avatar: true,
				score: true,
				level: true,
				createdAt: true,
				totMatches: true,
			},
			orderBy: [
				{score: 'desc'},
				{id: 'asc'},
			],
		});
		const avatarUrl = this.configService.getOrThrow<string>('AVATARS_URL');
	
		const leaderboard : Leaderboard[] = data.map((user, index) => ({
			...user,
			avatar: user.avatar ? avatarUrl + user.avatar : null,
			rank: index + 1,
		}));
		return leaderboard;
	}

	async createOAuthUser(data: { email: string; name: string; provider: string; providerId: string; passwordHash: string }) {
		const res = await this.prismaService.users.create({
			data: {
				email: data.email,
				name: data.name,
				provider: data.provider,
				providerId: data.providerId,
				password: data.passwordHash,
				role: "PLAYER",
			},
		});
		return res;
	}

	async acceptTerms(userId: number) {
		const user = await this.prismaService.users.update({
			where: { id: userId },
			data: { termsAcceptedAt: new Date() },
			select: { termsAcceptedAt: true },
		});
		return { termsAcceptedAt: user.termsAcceptedAt };
	}

	async findByProvider(provider: string, providerId: string) {
		return await this.prismaService.users.findUnique({
			where: { provider_providerId: { provider, providerId } },
		});
	}
}
