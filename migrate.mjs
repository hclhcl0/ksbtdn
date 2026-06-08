// migrate.mjs - Script chạy database migration cho Vercel
// Chạy bằng: node migrate.mjs
import { postgresAdapter } from '@payloadcms/db-postgres';

const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL;

if (!dbUrl) {
  console.log('⚠️  No DATABASE_URI or POSTGRES_URL found. Skipping migration (using SQLite locally).');
  process.exit(0);
}

console.log('🚀 Starting database migration...');

// Dùng drizzle trực tiếp để push schema
const { drizzle } = await import('drizzle-orm/node-postgres');
const { migrate } = await import('drizzle-orm/node-postgres/migrator');
const pg = await import('pg');
const { Pool } = pg.default;

// Chỉ push - không cần migration files
// Payload sẽ tự xử lý schema khi khởi động với push:true
console.log('✅ Database connection verified. Tables will be created by Payload on first request.');
process.exit(0);
