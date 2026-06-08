import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

// API route để chạy database migration
// Gọi: POST /api/migrate?secret=YOUR_SECRET
export async function POST(request: Request) {
  try {
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
