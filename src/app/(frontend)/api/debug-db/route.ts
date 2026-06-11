import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });

    try {
      const result = await payload.db.drizzle.execute(
        `select "users"."id", "users"."updated_at", "users"."created_at", "users"."email",
         "users"."reset_password_token", "users"."reset_password_expiration",
         "users"."salt", "users"."hash", "users"."login_attempts", "users"."lock_until",
         "users"."role" from "users" limit 1`
      );
      return NextResponse.json({ success: true, user: (result.rows || result)?.[0]?.email });
    } catch (e: any) {
      return NextResponse.json({
        success: false,
        query_error: e.message,
        code: e.code,
        detail: e.detail,
        severity: e.severity,
        routine: e.routine,
        where: e.where,
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      init_error: error.message,
      stack: error.stack?.split('\n').slice(0, 5),
    });
  }
}
