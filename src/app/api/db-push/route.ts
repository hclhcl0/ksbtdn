import { NextResponse } from 'next/server';
import pkg from 'pg';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const { Pool } = pkg;

// SQL để tạo các bảng còn thiếu
// Payload CMS postgres naming: {global_slug}_blocks_{block_slug_snake_case} (1 dấu gạch dưới sau blocks)
const MIGRATION_STATEMENTS = [
  // =====================================================
  // FIX 1: sidebarWidgets tables
  // =====================================================
  `CREATE TABLE IF NOT EXISTS "settings_blocks_categories_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar NOT NULL DEFAULT 'Chuyên mục',
    "limit" numeric DEFAULT 10,
    CONSTRAINT "settings_blocks_categories_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_categories_widget_order_idx" ON "settings_blocks_categories_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_categories_widget_parent_idx" ON "settings_blocks_categories_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_categories_widget_path_idx" ON "settings_blocks_categories_widget" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_recent_articles_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar NOT NULL DEFAULT 'Tin mới cập nhật',
    "limit" numeric DEFAULT 5,
    CONSTRAINT "settings_blocks_recent_articles_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_recent_articles_widget_order_idx" ON "settings_blocks_recent_articles_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_recent_articles_widget_parent_idx" ON "settings_blocks_recent_articles_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_recent_articles_widget_path_idx" ON "settings_blocks_recent_articles_widget" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_tiktok_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'Kênh TikTok CDC',
    "channel_id" integer,
    CONSTRAINT "settings_blocks_tiktok_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_tiktok_widget_order_idx" ON "settings_blocks_tiktok_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_tiktok_widget_parent_idx" ON "settings_blocks_tiktok_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_tiktok_widget_path_idx" ON "settings_blocks_tiktok_widget" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_facebook_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'Fanpage CDC',
    "page_url" varchar NOT NULL DEFAULT 'https://www.facebook.com/cdcdanang',
    "height" numeric DEFAULT 350,
    CONSTRAINT "settings_blocks_facebook_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_facebook_widget_order_idx" ON "settings_blocks_facebook_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_facebook_widget_parent_idx" ON "settings_blocks_facebook_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_facebook_widget_path_idx" ON "settings_blocks_facebook_widget" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_banner_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "image_id" integer,
    "link_url" varchar,
    "open_in_new_tab" boolean DEFAULT true,
    CONSTRAINT "settings_blocks_banner_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_banner_widget_order_idx" ON "settings_blocks_banner_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_banner_widget_parent_idx" ON "settings_blocks_banner_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_banner_widget_path_idx" ON "settings_blocks_banner_widget" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_custom_html_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "html_content" text NOT NULL,
    CONSTRAINT "settings_blocks_custom_html_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_custom_html_widget_order_idx" ON "settings_blocks_custom_html_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_custom_html_widget_parent_idx" ON "settings_blocks_custom_html_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_custom_html_widget_path_idx" ON "settings_blocks_custom_html_widget" USING btree ("_path")`,

  // =====================================================
  // FIX 2: main_menu tables
  // =====================================================
  `CREATE TABLE IF NOT EXISTS "main_menu" (
    "id" serial PRIMARY KEY NOT NULL,
    "menu_position" varchar DEFAULT 'top',
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "main_menu_menu_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "label" varchar,
    "url" varchar,
    CONSTRAINT "main_menu_menu_items_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "main_menu" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "main_menu_menu_items_order_idx" ON "main_menu_menu_items" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "main_menu_menu_items_parent_idx" ON "main_menu_menu_items" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "main_menu_menu_items_sub_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "label" varchar,
    "url" varchar,
    CONSTRAINT "main_menu_menu_items_sub_items_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "main_menu_menu_items" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "main_menu_menu_items_sub_items_order_idx" ON "main_menu_menu_items_sub_items" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "main_menu_menu_items_sub_items_parent_idx" ON "main_menu_menu_items_sub_items" USING btree ("_parent_id")`,
];

export async function GET(request: Request) {
  // Tạm tắt check secret để chạy migration trên Vercel
  /*
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (!secret || secret !== process.env.PAYLOAD_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  */

  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.DATABASE_URI;
  if (!dbUrl) {
    return NextResponse.json(
      { success: false, error: 'Không tìm thấy DATABASE_URI hoặc POSTGRES_URL trong biến môi trường' },
      { status: 500 }
    );
  }

  const needsSsl = dbUrl.includes('vercel-storage') || dbUrl.includes('neon.tech') || dbUrl.includes('sslmode=require');

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
  });

  const results: { sql: string; status: 'ok' | 'error' | 'skipped'; error?: string }[] = [];

  try {
    const client = await pool.connect();
    try {
      for (const statement of MIGRATION_STATEMENTS) {
        // Lấy 80 ký tự đầu để log ngắn gọn
        const shortLabel = statement.trim().replace(/\s+/g, ' ').substring(0, 90);
        try {
          await client.query(statement);
          results.push({ sql: shortLabel, status: 'ok' });
        } catch (err: any) {
          // Lỗi "already exists" là bình thường, coi như đã xong
          if (err.code === '42P07' || err.message?.includes('already exists')) {
            results.push({ sql: shortLabel, status: 'skipped', error: err.message });
          } else {
            results.push({ sql: shortLabel, status: 'error', error: err.message });
          }
        }
      }
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }

  const hasErrors = results.some(r => r.status === 'error');
  const errorCount = results.filter(r => r.status === 'error').length;
  const okCount = results.filter(r => r.status === 'ok').length;
  const skippedCount = results.filter(r => r.status === 'skipped').length;

  return NextResponse.json({
    success: !hasErrors,
    summary: `✅ Thành công: ${okCount} | ⏭ Đã tồn tại: ${skippedCount} | ❌ Lỗi: ${errorCount}`,
    message: hasErrors
      ? 'Migration có lỗi - kiểm tra mục results bên dưới để biết chi tiết'
      : 'Migration hoàn thành! Tất cả bảng sidebarWidgets và main_menu đã được tạo.',
    results,
  }, { status: hasErrors ? 207 : 200 });
}
