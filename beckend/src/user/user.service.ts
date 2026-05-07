import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto , CreateLoginDto} from './dto/create-user.dto';
import  * as bcrypt from "bcrypt"
import { UpdateUserDto } from './dto/updata-user.dto';
import { MailService } from './mail/mail.service'; 

@Injectable()
export class UserService {

	constructor(
		private readonly databaseService: DatabaseService,
		private mailService: MailService

	) {}

	async create(body: CreateUserDto) {

		const	hashedPassword = await bcrypt.hash(body.password, 10);
		const	newUser = {
			...body,
			password: hashedPassword
		}
		return this.databaseService.user.create({ data: newUser });
	}

	async findUser(body: UpdateUserDto)
	{
		const code = Math.floor(100000 + Math.random() * 900000).toString();
		const user = await this.databaseService.user.findUnique({ 
			where: { email: body.email} 
		}) 
		if (!user) throw ({message: 'User not found'});

		await this.databaseService.user.update({
			where: {
				id: user.id
			},
			data : {
				resetCode: code, 
				codeExpire: new Date(Date.now() + 2 * 60 * 1000)
			}
		})
		await this.mailService.sendResetCode(user.email, code);
		return {message: "Code sent to email"};
	}

	async resetCode(body: UpdateUserDto) {
		const user = await this.databaseService.user.findUnique({ 
			where: { email: body.email} 
		}) 
		if (!user) throw ({message: 'User not found'});

		if (!user.codeExpire || new Date(Date.now()) > user.codeExpire)
			throw ({ message: 'Time is over' });
		return {mesagge: "Successful"};
	}
	async login(body: CreateLoginDto) {
		const user = await this.databaseService.user.findUnique({
			where: {email: body.email}
		})
		if (!user)
			throw new Error ('User not found');
		const isMatch = await bcrypt.compare(body.password, user.password);
		if (!isMatch)
			throw new Error('Wrong password');
		return user;
	}

	async findAll(role?: 'ADMIN' | 'PLAYER') {
		if (role)
		{
			return this.databaseService.user.findMany( {
				where: {
					role,
				}
			});
		}
		return this.databaseService.user.findMany();
	}

	async findOne(id: number) {
		return this.databaseService.user.findUnique(
		{ 
			where: {id}
		});
	}

	async update(id: number, updateUserDto: UpdateUserDto) {
		return this.databaseService.user.update(
		{
			where: { id },
			data: updateUserDto,
		});
	}

	async remove(id: number) {
			return this.databaseService.user.delete(
			{
				where: { id },
			});
		}
}
