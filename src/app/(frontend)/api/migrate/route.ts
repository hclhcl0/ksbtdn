import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

// API route để chạy database migration
// Gọi: POST /api/migrate?secret=YOUR_SECRET
export async function POST(request: Request) {
  try {
    // Bảo mật đơn giản - kiểm tra secret key
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    if (secret !== process.env.PAYLOAD_SECRET && secret !== process.env.MIGRATE_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await getPayload({ config: configPromise });

    // Chạy migration
    await payload.db.migrate();

    return NextResponse.json({ 
      success: true, 
      message: 'Database migration completed successfully' 
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Migration failed',
      details: String(error)
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return NextResponse.json({ 
    message: 'Use POST /api/migrate?secret=YOUR_PAYLOAD_SECRET to run migrations' 
  });
}
