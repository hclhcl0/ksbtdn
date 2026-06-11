import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });

    try {
      const result = await payload.db.drizzle.execute(`select "users"."id", "users"."updated_at", "users"."created_at", "users"."email", "users"."reset_password_token", "users"."reset_password_expiration", "users"."salt", "users"."hash", "users"."login_attempts", "users"."lock_until", "users"."role" from "users" limit 1`);
      
      // Test articles query too
      try {
        await payload.db.drizzle.execute(`select "articles"."id" from "articles" limit 1`);
      } catch (e2: any) {
         return NextResponse.json({
          success: false,
          error_name: e2.name,
          error_message: e2.message,
          error_code: e2.code,
          error_detail: e2.detail,
          target: "articles"
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        result: result.rows || result,
      });
    } catch (dbError: any) {
      return NextResponse.json({
        success: false,
        error_name: dbError.name,
        error_message: dbError.message,
        error_code: dbError.code,
        error_detail: dbError.detail,
        error_hint: dbError.hint,
        target: "users"
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
