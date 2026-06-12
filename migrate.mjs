// migrate.mjs — Chạy tự động khi build trên Vercel/Coolify: node migrate.mjs && next build
// Chạy thủ công: node migrate.mjs
import pg from 'pg';
const { Pool } = pg;
import { MIGRATION_STATEMENTS } from './scripts/migrations.mjs';

const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.log('⚠️  Không tìm thấy DATABASE_URI — bỏ qua migration (đang dùng SQLite local).');
  process.exit(0);
}

console.log('🚀 Bắt đầu kiểm tra migration database...');

const hasSsl = dbUrl.includes('sslmode=require') ||
               dbUrl.includes('db.prisma.io') ||
               dbUrl.includes('vercel-storage.com') ||
               dbUrl.includes('neon.tech') ||
               dbUrl.includes('supabase.co');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: hasSsl ? { rejectUnauthorized: false } : false,
});

// Bắt lỗi pool để tránh unhandled exception làm crash tiến trình build (exit code 255)
pool.on('error', (err) => {
  console.error('⚠️ [Postgres Pool Error] Unexpected error on idle client:', err.message);
});

async function run() {
  const client = await pool.connect();
  console.log('📡 Đã kết nối database.');

  try {
    // Kiểm tra xem bảng 'users' đã tồn tại chưa
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    const dbExists = tableCheck.rows[0].exists;
    
    if (!dbExists) {
      console.log('ℹ️  Cơ sở dữ liệu trống (bảng "users" chưa tồn tại).');
      console.log('ℹ️  Bỏ qua chạy migration thủ công ở bước build. Payload CMS sẽ tự động khởi tạo schema ở runtime.');
      return;
    }

    console.log(`📦 Phát hiện database hiện có. Tiến hành chạy các bản vá migration (tổng số: ${MIGRATION_STATEMENTS.length})...`);
    let ok = 0, skipped = 0, failed = 0;

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
        }
      }
    }

    console.log(`\n✅ Migration hoàn tất: ${ok} applied, ${skipped} skipped, ${failed} failed`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error('💥 Migration crash:', err.message || err);
});
