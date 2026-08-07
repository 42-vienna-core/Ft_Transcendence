import { PrismaClient } from "@prisma/client";
import { hash } from 'argon2';
//import 'dotenv/config';

const prisma = new PrismaClient()

async function main() {
	const bots = [
		{email: 'bot1@ai.com', name: "AI Bot 1"},
		{email: 'bot2@ai.com', name: "AI Bot 2"},
		{email: 'bot3@ai.com', name: "AI Bot 3"},
	]
	const botPass = process.env.BOT_PASS;
	if (!botPass)
		throw new Error('Bot Password missing from .env')

	const password = await hash(botPass);

	for (const bot of bots){
		await prisma.users.upsert({
			where: {email: bot.email},
			update:{
				name: bot.name,
				password,
				isBot: true,
				role: "BOT",
			},
			create:{
				email: bot.email,
				name: bot.name,
				password: password,
				role: "BOT",
				isBot: true,
			},
		});
	}
}

main()
	.catch(async(e) => {
		console.error("Bot creation failed. Error: ", e);
		process.exit(1);
	})
	.finally(async () =>{
		await prisma.$disconnect();
	})