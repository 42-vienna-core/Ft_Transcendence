import { Injectable } from '@nestjs/common';
import { RegisterRequest } from '../auth/dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'argon2';

@Injectable()
export class UserService {
	public constructor(
		private readonly prismaService: PrismaService,
	) { }

	public async findByEmail(email: string) {
		const user = await this.prismaService.users.findUnique({
			where: { email }
		})
		return user
	}

	public async findById(id: number) {
		const user = await this.prismaService.users.findUnique({
			where: { id }
		})
		return user
	}

	public async create(dto: RegisterRequest) {
		const user = await this.prismaService.users.create({
			data: {
				name: dto.username,
				email: dto.email,
				password: await hash(dto.password),
			},
			select: {
				id: true,
			},
		})
		return user
	}
}

// constructor(
// private readonly databaseService: DatabaseService,
// private mailService: MailService,
// private JwtService: JwtService,

// ) { }


// async create(body: CreateUserDto) {

// 	const	hashedPassword = await bcrypt.hash(body.password, 10);
// 	const	newUser = {
// 		...body,
// 		password: hashedPassword
// 	}
// 	const res = await this.databaseService.user.create({ data: newUser });
// 	console.log(res.id)
// 	return res;
// }

// async findUser(body: UpdateUserDto)
// {
// 	const code = Math.floor(100000 + Math.random() * 900000).toString();
// 	const user = await this.databaseService.user.findUnique({
// 		where: { email: body.email}
// 	})
// 	if (!user)
// 		throw ({message: 'User not found'});

// 	await this.databaseService.user.update({
// 		where: {
// 			id: user.id
// 		},
// 		data : {
// 			resetCode: code,
// 			codeExpire: new Date(Date.now() + 2 * 60 * 1000)
// 		}
// 	})
// 	await this.mailService.sendResetCode(user.email, code);
// 	return {message: "Code sent to email"};
// }

// async resetCode(body: UpdateUserDto) {
// 	const user = await this.databaseService.user.findUnique({
// 		where: { email: body.email}
// 	})
// 	if (!user) throw ({message: 'User not found'});

// 	if (!user.codeExpire || new Date(Date.now()) > user.codeExpire)
// 		throw ({ message: 'Time is over' });

// 	if (user.resetCode !== body.resetCode)
// 		throw ({ message: 'Wrong code' });

// 	const	hashedPassword = await bcrypt.hash(String(body.password), 10);
// 	return await this.databaseService.user.update({
// 		where: {id: user.id},
// 		data:	{
// 					password: hashedPassword,
// 					resetCode: null,
// 					codeExpire: null,
// 				},
// 	})
// }
// async login(body: CreateLoginDto) {
// 	const user = await this.databaseService.user.findUnique({
// 		where: {email: body.email}
// 	})
// 	if (!user)
// 		throw new Error ('User not found');

// 	const isMatch = await bcrypt.compare(body.password, user.password);
// 	if (!isMatch)
// 		throw new Error('Wrong password');
// 	const payload = { email: user.email, id : user.id };
// 	const access_token = await this.JwtService.signAsync(payload);
// 	return {access_token};
// }
// async getProfile(req: any) {
// 	return req.user;
// }

// async findAll(role?: 'ADMIN' | 'PLAYER') {
// 	if (role)
// 	{
// 		return this.databaseService.user.findMany( {
// 			where: {
// 				role,
// 			}
// 		});
// 	}
// 	return this.databaseService.user.findMany();
// }

// async findOne(id: number) {
// 	return this.databaseService.user.findUnique(
// 	{
// 		where: {id}
// 	});
// }

// async update(id: number, updateUserDto: UpdateUserDto) {
// 	return this.databaseService.user.update(
// 	{
// 		where: { id },
// 		data: updateUserDto,
// 	});
// }

// async remove(id: number) {
// 		return this.databaseService.user.delete(
// 		{
// 			where: { id },
// 		});
// }
// }
