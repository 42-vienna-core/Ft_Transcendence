import { PrismaClient } from "@prisma/client";
import { hash } from 'argon2';

const prisma = new PrismaClient()

async function main() {
	const bots = [
		{email: 'bot1@ai.com', name: "AI Bot 1", color: '#007BFF'},
		{email: 'bot2@ai.com', name: "AI Bot 2", color: '#FF3B30'},
		{email: 'bot3@ai.com', name: "AI Bot 3", color: '#FF00FF'},
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
				color: bot.color
			},
			create:{
				email: bot.email,
				name: bot.name,
				password: password,
				role: "BOT",
				isBot: true,
				color: bot.color
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