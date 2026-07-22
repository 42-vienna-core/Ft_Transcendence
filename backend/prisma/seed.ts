import { PrismaClient } from "@prisma/client";
import { hash } from 'argon2';

const prisma = new PrismaClient()

async function main() {
	const bots = [
		{email: 'bot1@ai.com', name: "AI Bot 1"},
		{email: 'bot2@ai.com', name: "AI Bot 2"},
		{email: 'bot3@ai.com', name: "AI Bot 3"},
	]
	const password = await hash('BOT_PASS');	
	//password value needs to be changed and taken from env

	for (const bot of bots){
		await prisma.users.upsert({
			where: {email: bot.email},
			update:{
				name: bot.name,
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