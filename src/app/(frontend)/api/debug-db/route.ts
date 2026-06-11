import { NextResponse } from 'next/server';
import pg from 'pg';

export const dynamic = 'force-dynamic';

// Route kiểm tra DB health — dùng để verify sau khi deploy
export async function GET() {
  const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL;
  if (!dbUrl) return NextResponse.json({ ok: false, error: 'No DB URL' });

  const pool = new pg.Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 5000,
  });

  const client = await pool.connect();
  try {
    const checks: Record<string, string> = {};

    // Kiểm tra các bảng quan trọng
    const tables = ['users', 'articles', 'categories', 'media', 'org_units', 'users_sessions', 'users_rels', 'video_channels', 'form_submissions', 'theme_settings'];
    for (const table of tables) {
      try {
        const r = await client.query(`SELECT COUNT(*) FROM "${table}"`);
        checks[table] = `✅ ${r.rows[0].count} rows`;
      } catch (e: any) {
        checks[table] = `❌ ${e.message}`;
      }
    }

    // Kiểm tra cột đặc biệt
    try {
      await client.query(`SELECT review_status FROM articles LIMIT 0`);
      checks['articles.review_status'] = '✅ exists';
    } catch {
      checks['articles.review_status'] = '❌ missing';
    }

    const allOk = Object.values(checks).every(v => v.startsWith('✅'));
    return NextResponse.json({ ok: allOk, checks });
  } finally {
    client.release();
    await pool.end();
  }
}
