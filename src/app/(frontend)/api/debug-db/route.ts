import { NextResponse } from 'next/server';
import pg from 'pg';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: 'No DB URL' });
  }

  const pool = new pg.Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 5000,
  });

  const client = await pool.connect();
  try {
    // Kiểm tra trạng thái transaction
    const txRes = await client.query(`SELECT pg_current_xact_id_if_assigned()`);
    
    // Thử query users
    let usersResult, usersError;
    try {
      usersResult = await client.query(
        `SELECT id, email, role FROM "users" LIMIT 1`
      );
    } catch (e: any) {
      usersError = { message: e.message, code: e.code, detail: e.detail };
    }

    // Kiểm tra các cột của bảng users
    let columnsResult;
    try {
      columnsResult = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`
      );
    } catch (e: any) {}

    return NextResponse.json({
      success: true,
      tx: txRes.rows[0],
      users: usersResult?.rows?.[0],
      usersError,
      userColumns: columnsResult?.rows?.map((r: any) => r.column_name),
    });
  } finally {
    client.release();
    await pool.end();
  }
}
