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

	async search () {
		const users = await this.databaseService.users.findMany();
		const res =  users.map((item) => {
			return {
				Username: item.Username,
				id: item.id
			}
		})
		return res;
	}
	// async resetCode(body: UpdateUserDto) {
	// 	const user = await this.databaseService.users.findUnique({ 
	// 		where: { email: body.email}
	// 	}) 
		
	// 	if (!user) throw ({message: 'User not found'});

	// 	if (!user.codeExpire || new Date(Date.now()) > user.codeExpire)
	// 		throw ({ message: 'Time is over' });

	// 	if (user.resetCode !== body.resetCode)
	// 		throw ({ message: 'Wrong code' });
	// }

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
