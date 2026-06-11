// migrate.mjs — Chạy tự động khi build trên Vercel: node migrate.mjs && next build
// Chạy thủ công: node migrate.mjs
import pg from 'pg';
const { Pool } = pg;
import { MIGRATION_STATEMENTS } from './scripts/migrations.mjs';

const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.log('⚠️  Không tìm thấy DATABASE_URI — bỏ qua migration (đang dùng SQLite local).');
  process.exit(0);
}

console.log('🚀 Bắt đầu migration database...');
console.log(`📦 Tổng số statements: ${MIGRATION_STATEMENTS.length}`);

const hasSsl = dbUrl.includes('sslmode=require') ||
               dbUrl.includes('db.prisma.io') ||
               dbUrl.includes('vercel-storage.com') ||
               dbUrl.includes('neon.tech') ||
               dbUrl.includes('supabase.co');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: hasSsl ? { rejectUnauthorized: false } : false,
});

async function run() {
  const client = await pool.connect();
  console.log('📡 Đã kết nối database.');

  let ok = 0, skipped = 0, failed = 0;

  try {
    for (let i = 0; i < MIGRATION_STATEMENTS.length; i++) {
      const statement = MIGRATION_STATEMENTS[i];
      const label = statement.trim().replace(/\s+/g, ' ').substring(0, 80);
      try {
        await client.query(statement);
        ok++;
      } catch (err) {
        if (
          err.code === '42P07' ||
          err.code === '42701' ||
          err.message?.includes('already exists')
        ) {
          skipped++;
        } else {
          console.error(`❌ [${i + 1}] FAILED: ${label}`);
          console.error(`   Reason: ${err.message} (code: ${err.code})`);
          failed++;
          // Không exit — tiếp tục chạy để apply được nhiều nhất có thể
        }
      }
    }
  } finally {
    client.release();
    await pool.end();
  }

  console.log(`\n✅ Migration xong: ${ok} applied, ${skipped} skipped, ${failed} failed`);

  if (failed > 0) {
    console.error(`\n⚠️  Có ${failed} statement thất bại — kiểm tra log phía trên.`);
    // Không exit(1) để build vẫn tiếp tục — lỗi sẽ được phát hiện ở runtime
  }
}

run().catch(err => {
  console.error('💥 Migration crash:', err);
  // Không exit(1) — để build vẫn chạy được
});
