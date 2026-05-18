import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  await prisma.plan.upsert({
    where: { name: 'Free' },
    update: {},
    create: {
      name: 'Free',
      price: 0,
      maxServices: 1,
      maxFeedback: 50,
      hasAnalytics: false,
      hasNotifications: false,
    },
  });

  await prisma.plan.upsert({
    where: { name: 'Pro' },
    update: {},
    create: {
      name: 'Pro',
      price: 12,
      maxServices: -1,
      maxFeedback: -1,
      hasAnalytics: true,
      hasNotifications: true,
    },
  });

  console.log('Seed complete: Free and Pro plans upserted.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
