"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
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
//# sourceMappingURL=seed.js.map