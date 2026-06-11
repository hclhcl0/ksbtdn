import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    const results: any = {};

    try {
      await payload.db.drizzle.execute(`
        CREATE TABLE IF NOT EXISTS "org_units" (
          "id" serial PRIMARY KEY NOT NULL,
          "name" varchar NOT NULL,
          "unit_type" varchar DEFAULT 'khoa' NOT NULL,
          "order" numeric DEFAULT 99,
          "short_description" varchar,
          "image_id" integer REFERENCES "media"("id") ON DELETE set null,
          "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
          "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
        );
      `);
      results.orgUnitsCreate = "Success";
    } catch(e: any) { results.orgUnitsCreateError = e.message; }

    try {
      await payload.db.drizzle.execute(`
        CREATE INDEX IF NOT EXISTS "org_units_created_at_idx" ON "org_units" ("created_at");
      `);
    } catch(e: any) {}

    try {
      await payload.db.drizzle.execute(`
        CREATE TABLE IF NOT EXISTS "org_units_members" (
          "_order" integer NOT NULL,
          "_parent_id" integer NOT NULL REFERENCES "org_units"("id") ON DELETE cascade,
          "id" varchar PRIMARY KEY NOT NULL,
          "member_name" varchar NOT NULL,
          "position" varchar DEFAULT 'nhan_vien' NOT NULL,
          "academic_title" varchar,
          "email" varchar,
          "avatar_id" integer REFERENCES "media"("id") ON DELETE set null,
          "bio" varchar
        );
      `);
      results.orgUnitsMembersCreate = "Success";
    } catch(e: any) { results.orgUnitsMembersCreateError = e.message; }

    try {
      await payload.db.drizzle.execute(`
        CREATE INDEX IF NOT EXISTS "org_units_members_order_idx" ON "org_units_members" ("_order");
        CREATE INDEX IF NOT EXISTS "org_units_members_parent_id_idx" ON "org_units_members" ("_parent_id");
      `);
    } catch(e: any) {}

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
