import { Injectable} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { MailService } from '../mail/mail.service'; 
import { RedisService } from '../redis/redis.service';
import { CreateUsersDto } from 'src/dto/create-users.dto';
import { UpdateUserDto } from 'src/dto/updata-users.dto';

@Injectable()
export class UsersService {

	constructor(
		private readonly databaseService: DatabaseService,
		private mailService: MailService,
		private redisService: RedisService
	) {}

	async create(body: CreateUsersDto) {
		
		const res = await this.databaseService.users.create({ data: body});
		return res;
	}

	async findUser(body: UpdateUserDto)
	{
		const code = Math.floor(100000 + Math.random() * 900000).toString();
		const user = await this.databaseService.users.findUnique({ 
			where: { Email: body.Email} 
		}) 
		if (!user)
			throw ({message: 'User not found'});

		await this.databaseService.users.update({
			where: {
				id: user.id
			},
			data : {
				resetCode: code, 
				codeExpire: new Date(Date.now() + 2 * 60 * 1000)
			}
		})
		await this.mailService.sendResetCode(user.Email, code);
		return {message: "Code sent to email"};
	}

	async search(id: number) {
		const userFriends = await this.databaseService.friends.findMany({
			where: { userId: id },
			select: { friendId: true },
		});

		const friendIds = userFriends.map(f => f.friendId);
		const users = await this.databaseService.users.findMany({
			where: {
				id: { notIn: [id, ...friendIds] },
			},
			select: { id: true, Username: true },
		});
		console.log(users)
		return users;
	}
	

	async findAll(Role?: 'ADMIN' | 'PLAYER') {
		if (Role)
		{
			return this.databaseService.users.findMany( {
				where: { role: Role }
			});
		}
		return this.databaseService.users.findMany();
	}

	async findOne(id: number) {
		return this.databaseService.users.findUnique( {  where: { id } } );
	}

	async update(id: number, updateUserDto: UpdateUserDto) {
		const user = await this.databaseService.users.update(
		{
			where: { id },
			data: updateUserDto,
		});
		return user;
	}

	async remove(id: number) {
		const user = await this.databaseService.users.delete(
		{
			where: { id },
		});
		await this.redisService.deleteToken(user.id);
		return user;
	}
}
