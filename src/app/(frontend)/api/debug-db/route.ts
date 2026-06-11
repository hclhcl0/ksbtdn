import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    
    // Query đúng chuẩn Payload login
    try {
      const result = await payload.db.drizzle.execute(
        `SELECT "users"."id", "users"."updated_at", "users"."created_at", "users"."email",
         "users"."reset_password_token", "users"."reset_password_expiration",
         "users"."salt", "users"."hash", "users"."login_attempts", "users"."lock_until",
         "users"."role" FROM "users" LIMIT 1`
      );
      return NextResponse.json({ 
        success: true, 
        email: (result.rows as any[])?.[0]?.email
      });
    } catch (qe: any) {
      return NextResponse.json({
        success: false,
        stage: 'query',
        message: qe.message,
        code: qe.code,
        detail: qe.detail,
        severity: qe.severity,
      });
    }
  } catch (initErr: any) {
    return NextResponse.json({
      success: false,
      stage: 'init',
      message: initErr.message,
      code: initErr.code,
      detail: initErr.detail,
      stack: initErr.stack?.split('\n').slice(0, 8),
    });
  }
}
