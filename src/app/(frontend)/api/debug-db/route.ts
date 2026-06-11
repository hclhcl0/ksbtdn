import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });

    try {
      const result = await payload.db.drizzle.execute(`select "users"."id", "users"."email" from "users" limit 1`);
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
        error_stack: dbError.stack,
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
