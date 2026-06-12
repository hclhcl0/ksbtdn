import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise });

    // Liệt kê các method có sẵn trong db để debug
    const dbMethods = Object.keys(payload.db).filter(k => typeof (payload.db as any)[k] === 'function');

    let pushResult = null;
    let migrateResult = null;
    let pushError = null;
    let migrateError = null;

    // Thử push() - tạo bảng từ schema hiện tại
    if (typeof (payload.db as any).push === 'function') {
      try {
        await (payload.db as any).push();
        pushResult = 'success';
      } catch (e: any) {
        pushError = e?.message;
      }
    }

    // Thử migrate() - chạy migration files
    if (typeof (payload.db as any).migrate === 'function') {
      try {
        await (payload.db as any).migrate();
        migrateResult = 'success';
      } catch (e: any) {
        migrateError = e?.message;
      }
    }

    // Thử drizzle push trực tiếp
    let drizzlePushResult = null;
    let drizzlePushError = null;
    if ((payload.db as any).drizzle && typeof (payload.db as any).schema !== 'undefined') {
      try {
        const { pushSchema } = await import('drizzle-kit/api');
        // @ts-ignore
        await pushSchema((payload.db as any).schema, (payload.db as any).drizzle);
        drizzlePushResult = 'success';
      } catch (e: any) {
        drizzlePushError = e?.message;
      }
    }

    return NextResponse.json({ 
      success: true, 
      dbMethods,
      pushResult, pushError,
      migrateResult, migrateError,
      drizzlePushResult, drizzlePushError,
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error?.message || 'Failed',
      details: String(error)
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST /api/migrate to run migrations' });
}
