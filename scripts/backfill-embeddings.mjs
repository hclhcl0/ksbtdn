/**
 * Script backfill embedding cho tất cả tài liệu trong AiKnowledge chưa có embedding.
 * Chạy: node scripts/backfill-embeddings.mjs
 * 
 * Cần env: ZALO_DATABASE_URL hoặc DATABASE_URI, GEMINI_API_KEY
 */

import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";

// ── Cấu hình ────────────────────────────────────────
const BATCH_SIZE = 5;       // Số tài liệu xử lý song song
const DELAY_MS   = 500;     // Delay giữa các batch (tránh rate limit)
const MAX_CHARS  = 8000;    // Giới hạn ký tự input cho embedding
// ────────────────────────────────────────────────────

const prisma = new PrismaClient();

async function generateEmbedding(text, apiKey) {
  const ai = new GoogleGenAI({ apiKey });
  const result = await ai.models.embedContent({
    model: "text-embedding-004",
    contents: text.slice(0, MAX_CHARS),
    config: { taskType: "RETRIEVAL_DOCUMENT" },
  });
  return result.embeddings[0].values;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // Lấy API key: ưu tiên DB pool, fallback env
  let apiKey = process.env.GEMINI_API_KEY;
  try {
    const keyFromDb = await prisma.geminiApiKey.findFirst({ where: { isActive: true } });
    if (keyFromDb?.apiKey) apiKey = keyFromDb.apiKey;
  } catch {}

  if (!apiKey) {
    console.error("❌ Không tìm thấy Gemini API key. Set GEMINI_API_KEY hoặc thêm key vào bảng GeminiApiKey.");
    process.exit(1);
  }

  // Đếm tổng tài liệu chưa có embedding
  const total = await prisma.aiKnowledge.count({ where: { embedding: null } });
  if (total === 0) {
    console.log("✅ Tất cả tài liệu đã có embedding. Không cần backfill.");
    await prisma.$disconnect();
    return;
  }

  console.log(`📚 Tìm thấy ${total} tài liệu chưa có embedding. Bắt đầu backfill...`);
  console.log(`   Key: ...${apiKey.slice(-6)} | Batch: ${BATCH_SIZE} | Delay: ${DELAY_MS}ms\n`);

  let processed = 0;
  let failed = 0;

  // Xử lý theo batch
  while (true) {
    const docs = await prisma.aiKnowledge.findMany({
      where: { embedding: null },
      take: BATCH_SIZE,
      select: { id: true, title: true, category: true, content: true },
    });

    if (docs.length === 0) break;

    // Xử lý song song trong batch
    await Promise.allSettled(
      docs.map(async (doc) => {
        try {
          const textToEmbed = `${doc.title}\n${doc.category}\n${doc.content}`;
          const vec = await generateEmbedding(textToEmbed, apiKey);
          await prisma.aiKnowledge.update({
            where: { id: doc.id },
            data: { embedding: JSON.stringify(vec) },
          });
          processed++;
          console.log(`  ✅ [${processed}/${total}] ID=${doc.id} "${doc.title.slice(0, 50)}"`);
        } catch (e) {
          failed++;
          console.warn(`  ❌ ID=${doc.id} "${doc.title.slice(0, 40)}" — ${e.message}`);
        }
      })
    );

    if (docs.length === BATCH_SIZE) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n🎉 Hoàn thành! Thành công: ${processed} | Thất bại: ${failed}`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error("Script lỗi:", e);
  process.exit(1);
});
