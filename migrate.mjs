// migrate.mjs - Script chạy database migration cho Vercel/Production
// Chạy bằng: node migrate.mjs
import pg from 'pg';
const { Pool } = pg;
import { MIGRATION_STATEMENTS } from './scripts/migrations.mjs';

const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.log('⚠️ No DATABASE_URI, POSTGRES_URL or DATABASE_URL found. Skipping migration (using SQLite locally).');
  process.exit(0);
}

console.log('🚀 Starting database migration on Production DB...');

// Cấu hình SSL tự động cho các DB cloud (Supabase, Vercel, Prisma, v.v.)
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
  console.log('📡 Connected to the database.');
  
  try {
    for (let i = 0; i < MIGRATION_STATEMENTS.length; i++) {
      const statement = MIGRATION_STATEMENTS[i];
      const shortLabel = statement.trim().replace(/\s+/g, ' ').substring(0, 80);
      try {
        await client.query(statement);
        console.log(`[${i + 1}/${MIGRATION_STATEMENTS.length}] ✅ Success: ${shortLabel}...`);
      } catch (err) {
        // Mã lỗi 42P07: relation already exists
        // Mã lỗi 42701: column already exists
        if (
          err.code === '42P07' || 
          err.code === '42701' ||
          err.message?.includes('already exists') || 
          err.message?.includes('already exist')
        ) {
          console.log(`[${i + 1}/${MIGRATION_STATEMENTS.length}] ⏭ Skipped: ${shortLabel}... (already exists)`);
        } else {
          console.error(`[${i + 1}/${MIGRATION_STATEMENTS.length}] ❌ Error executing: ${shortLabel}`);
          console.error(`Reason: ${err.message} (${err.code})`);
          process.exit(1);
        }
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
  console.log('🎉 Database migration completed successfully!');
}

run().catch(err => {
  console.error('💥 Migration failed:', err);
  process.exit(1);
});
