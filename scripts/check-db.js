const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const [keys, noEmb, total] = await Promise.all([
    p.geminiApiKey.count({ where: { isActive: true } }),
    p.aiKnowledge.count({ where: { embedding: null } }),
    p.aiKnowledge.count()
  ]);
  console.log('Active Gemini keys:', keys);
  console.log('Docs without embedding:', noEmb, '/', total);
  await p.$disconnect();
}
main();
