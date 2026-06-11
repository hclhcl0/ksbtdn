import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });

    if (!payload.db || !payload.db.drizzle) {
      return NextResponse.json({ error: "Drizzle is not available" });
    }

    // Try to describe 'users'
    const usersResult = await payload.db.drizzle.execute(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);

    // Fetch theme-settings schema
    const themeResult = await payload.db.drizzle.execute(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'theme_settings'
    `);

    return NextResponse.json({
      success: true,
      usersColumns: usersResult.rows || usersResult,
      themeColumns: themeResult.rows || themeResult
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
