import { PrismaClient, Role } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();

const COLORS = [
	"#39FF14", "#007BFF", "#FF3B30", "#FF00FF", "#FFD700",
	"#00CED1", "#FF8C00", "#9370DB", "#20B2AA", "#DC143C",
];

async function main() {
	const password = await hash("Test1234!");

	for (let i = 1; i <= 20; i++) {
		const email = `testuser${i}@example.com`;
		const name = `TestUser${i}`;
		const color = COLORS[i % COLORS.length];
		const score = Math.floor(Math.random() * 1000);
		const level = Math.floor(Math.random() * 10);
		const totMatches = Math.floor(Math.random() * 50);

		const user = await prisma.users.upsert({
			where: { email },
			update: { name, color, score, level, totMatches },
			create: {
				email,
				name,
				password,
				role: Role.PLAYER,
				color,
				score,
				level,
				totMatches,
			},
		});
		console.log(`✅ Created/updated user #${user.id} (${user.email})`);
	}
}

main()
	.catch(async (e) => {
		console.error("User seeding failed. Error: ", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
