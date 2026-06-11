import { NextResponse } from 'next/server';
import pkg from 'pg';
import { MIGRATION_STATEMENTS } from '../../../../scripts/migrations.mjs';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const { Pool } = pkg;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (!secret || secret !== process.env.PAYLOAD_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.DATABASE_URI;
  if (!dbUrl) {
    return new NextResponse('Missing DB URL in environment', { status: 500 });
  }

  const action = searchParams.get('action');
  if (action === 'get-url') {
    return new NextResponse(dbUrl, { status: 200 });
  }

  const needsSsl = dbUrl.includes('vercel-storage') || 
                   dbUrl.includes('neon.tech') || 
                   dbUrl.includes('sslmode=require') ||
                   dbUrl.includes('db.prisma.io') ||
                   dbUrl.includes('supabase.co');

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
  });

  const results: { sql: string; status: 'ok' | 'error' | 'skipped'; error?: string }[] = [];

  try {
    const client = await pool.connect();
    try {
      for (const statement of MIGRATION_STATEMENTS) {
        // Lấy 90 ký tự đầu để log ngắn gọn
        const shortLabel = statement.trim().replace(/\s+/g, ' ').substring(0, 90);
        try {
          await client.query(statement);
          results.push({ sql: shortLabel, status: 'ok' });
        } catch (err: any) {
          // Lỗi "already exists" (42P07) hoặc "column already exists" (42701) là bình thường, coi như đã xong
          if (
            err.code === '42P07' || 
            err.code === '42701' || 
            err.message?.includes('already exists') ||
            err.message?.includes('already exist')
          ) {
            results.push({ sql: shortLabel, status: 'skipped', error: err.message });
          } else {
            results.push({ sql: shortLabel, status: 'error', error: err.message });
          }
        }
      }
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }

  const hasErrors = results.some(r => r.status === 'error');
  const errorCount = results.filter(r => r.status === 'error').length;
  const okCount = results.filter(r => r.status === 'ok').length;
  const skippedCount = results.filter(r => r.status === 'skipped').length;

  return NextResponse.json({
    success: !hasErrors,
    summary: `✅ Thành công: ${okCount} | ⏭ Đã tồn tại: ${skippedCount} | ❌ Lỗi: ${errorCount}`,
    message: hasErrors
      ? 'Migration có lỗi - kiểm tra mục results bên dưới để biết chi tiết'
      : 'Migration hoàn thành! Tất cả bảng và cấu trúc cơ sở dữ liệu đã được cập nhật.',
    results,
  }, { status: hasErrors ? 207 : 200 });
}
