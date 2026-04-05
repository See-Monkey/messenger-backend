import { prisma } from "../config/prisma.js";

beforeEach(async () => {
  await prisma.$executeRawUnsafe(`
		TRUNCATE TABLE 
			"Message",
			"ChatMember",
			"Chat",
			"User"
		RESTART IDENTITY CASCADE;
	`);
});

afterAll(async () => {
  await prisma.$disconnect();
});
