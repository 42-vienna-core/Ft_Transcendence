import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hash } from 'argon2';

interface AdminSeed {
  index: number;
  username: string;
  email: string;
  password: string;
}

function loadAdminsFromEnv(): AdminSeed[] {
  const admins: AdminSeed[] = [];
  let index = 1;

  while (true) {
    const prefix = `ADMIN_${index}_`;
    const email = process.env[`${prefix}EMAIL`];
    const password = process.env[`${prefix}PASSWORD`];
    const username = process.env[`${prefix}USERNAME`];

    const hasAnyValue = email || password || username;
    if (!hasAnyValue) {
      break;
    }

    if (!email || !password) {
      console.warn( `⚠️  ADMIN_${index}_* Not a valid admin user`, );
      index++;
      continue;
    }

    admins.push({ index, username: username ?? `admin${index}`, email, password });
    index++;
  }
  return admins;
}

async function main() {
  const admins = loadAdminsFromEnv();

  if (admins.length === 0) {
    console.log('No admin users found in environment variables. Skipping seeding.');
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    for (const admin of admins) {
      const existing = await prisma.users.findUnique({ where: { email: admin.email } });

      if (existing) {
        console.log(`Admin already exists (${admin.email}), skipping.`);
        continue;
      }
      const hashedPassword = await hash(admin.password);
      const created = await prisma.users.create( {
        data: {
          name: admin.username,
          email: admin.email,
          password: hashedPassword,
          role: Role.ADMIN,
          termsAcceptedAt: new Date(),
        },
      });
      console.log(` ✅ Created admin #${created.id} (${created.email}).`);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Failed to seed admin users:', error);
  process.exitCode = 1;
});