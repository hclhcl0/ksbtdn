const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "AiKnowledge" ADD COLUMN IF NOT EXISTS "embedding" TEXT`);
    console.log('OK: column embedding added to AiKnowledge');
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
