import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    const results: any = {};

    try {
      results.users = await payload.db.drizzle.execute(`select * from "users" limit 1`);
    } catch(e: any) { results.usersError = e.message; }

    try {
      results.articles = await payload.db.drizzle.execute(`select * from "articles" limit 1`);
    } catch(e: any) { results.articlesError = e.message; }

    try {
      results.preferences = await payload.db.drizzle.execute(`select * from "payload_preferences" limit 1`);
    } catch(e: any) { results.preferencesError = e.message; }

    try {
      results.orgUnits = await payload.db.drizzle.execute(`select * from "org_units" limit 1`);
    } catch(e: any) { results.orgUnitsError = e.message; }

    try {
      results.themeSettings = await payload.db.drizzle.execute(`select * from "theme_settings" limit 1`);
    } catch(e: any) { results.themeSettingsError = e.message; }

    return NextResponse.json({
      success: true,
      errors: {
        users: results.usersError,
        articles: results.articlesError,
        preferences: results.preferencesError,
        orgUnits: results.orgUnitsError,
        themeSettings: results.themeSettingsError
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
