import { NextResponse } from 'next/server';
import pg from 'pg';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL;
  if (!dbUrl) return NextResponse.json({ error: 'No DB URL' });

  const pool = new pg.Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });
  const client = await pool.connect();
  const results: Record<string, string> = {};

  const statements = [
    // Fix users_sessions table (sessions support)
    `CREATE TABLE IF NOT EXISTS "users_sessions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
      "id" varchar PRIMARY KEY NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now(),
      "expires_at" timestamp(3) with time zone
    )`,
    `CREATE INDEX IF NOT EXISTS "users_sessions_order_idx" ON "users_sessions" USING btree ("_order")`,
    `CREATE INDEX IF NOT EXISTS "users_sessions_parent_idx" ON "users_sessions" USING btree ("_parent_id")`,

    // Fix users_rels table (allowedCategories relationship)
    `CREATE TABLE IF NOT EXISTS "users_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
      "path" varchar NOT NULL,
      "categories_id" integer REFERENCES "categories"("id") ON DELETE cascade
    )`,
    `CREATE INDEX IF NOT EXISTS "users_rels_order_idx" ON "users_rels" USING btree ("order")`,
    `CREATE INDEX IF NOT EXISTS "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id")`,
    `CREATE INDEX IF NOT EXISTS "users_rels_path_idx" ON "users_rels" USING btree ("path")`,

    // Fix users table - thêm cột name nếu chưa có
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" varchar`,

    // Fix articles - thiếu cột review_status
    `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "review_status" varchar DEFAULT 'draft'`,
    // Fix articles versions table
    `ALTER TABLE "_articles_v" ADD COLUMN IF NOT EXISTS "version_review_status" varchar DEFAULT 'draft'`,
    // Fix articles - có thể thiếu author_name, views
    `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "author_name" varchar`,
    `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "views" numeric DEFAULT 0`,
    // Fix payload_locked_documents_rels - org_units
    `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "org_units_id" integer`,
    `ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_org_units_fk"`,
    `ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_org_units_fk" FOREIGN KEY ("org_units_id") REFERENCES "org_units"("id") ON DELETE cascade ON UPDATE no action`,
    `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_org_units_id_idx" ON "payload_locked_documents_rels" USING btree ("org_units_id")`,
    // theme_settings global
    `CREATE TABLE IF NOT EXISTS "theme_settings" (
      "id" serial PRIMARY KEY NOT NULL,
      "primary_color" varchar DEFAULT '#006C5B',
      "secondary_color" varchar DEFAULT '#004F45',
      "accent_color" varchar DEFAULT '#00A651',
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`,
  ];

  try {
    for (const sql of statements) {
      const key = sql.trim().substring(0, 60);
      try {
        await client.query(sql);
        results[key] = '✅ OK';
      } catch (e: any) {
        if (e.code === '42P07' || e.code === '42701' || e.message?.includes('already exists')) {
          results[key] = '⏭ already exists';
        } else {
          results[key] = `❌ ${e.message} (${e.code})`;
        }
      }
    }
    return NextResponse.json({ success: true, results });
  } finally {
    client.release();
    await pool.end();
  }
}
