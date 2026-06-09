import { NextResponse } from 'next/server';
import pkg from 'pg';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const { Pool } = pkg;

// SQL để tạo các bảng còn thiếu cho sidebarWidgets trong Settings global
// Payload CMS postgres naming: {global_slug}__blocks_{block_slug_snake_case}
const MIGRATION_STATEMENTS = [
  // 1. Widget Chuyên mục (categoriesWidget)
  `CREATE TABLE IF NOT EXISTS "settings__blocks_categories_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar NOT NULL DEFAULT 'Chuyên mục',
    "limit" numeric DEFAULT 10,
    CONSTRAINT "settings__blocks_categories_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_categories_widget_order_idx" ON "settings__blocks_categories_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_categories_widget_parent_idx" ON "settings__blocks_categories_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_categories_widget_path_idx" ON "settings__blocks_categories_widget" USING btree ("_path")`,

  // 2. Widget Bài viết mới nhất (recentArticlesWidget)
  `CREATE TABLE IF NOT EXISTS "settings__blocks_recent_articles_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar NOT NULL DEFAULT 'Tin mới cập nhật',
    "limit" numeric DEFAULT 5,
    CONSTRAINT "settings__blocks_recent_articles_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_recent_articles_widget_order_idx" ON "settings__blocks_recent_articles_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_recent_articles_widget_parent_idx" ON "settings__blocks_recent_articles_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_recent_articles_widget_path_idx" ON "settings__blocks_recent_articles_widget" USING btree ("_path")`,

  // 3. Widget TikTok (tiktokWidget)
  `CREATE TABLE IF NOT EXISTS "settings__blocks_tiktok_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'Kênh TikTok CDC',
    "channel_id" integer,
    CONSTRAINT "settings__blocks_tiktok_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_tiktok_widget_order_idx" ON "settings__blocks_tiktok_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_tiktok_widget_parent_idx" ON "settings__blocks_tiktok_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_tiktok_widget_path_idx" ON "settings__blocks_tiktok_widget" USING btree ("_path")`,

  // 4. Widget Facebook Fanpage (facebookWidget)
  `CREATE TABLE IF NOT EXISTS "settings__blocks_facebook_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'Fanpage CDC',
    "page_url" varchar NOT NULL DEFAULT 'https://www.facebook.com/cdcdanang',
    "height" numeric DEFAULT 350,
    CONSTRAINT "settings__blocks_facebook_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_facebook_widget_order_idx" ON "settings__blocks_facebook_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_facebook_widget_parent_idx" ON "settings__blocks_facebook_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_facebook_widget_path_idx" ON "settings__blocks_facebook_widget" USING btree ("_path")`,

  // 5. Widget Banner Quảng cáo (bannerWidget)
  `CREATE TABLE IF NOT EXISTS "settings__blocks_banner_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "image_id" integer,
    "link_url" varchar,
    "open_in_new_tab" boolean DEFAULT true,
    CONSTRAINT "settings__blocks_banner_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_banner_widget_order_idx" ON "settings__blocks_banner_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_banner_widget_parent_idx" ON "settings__blocks_banner_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_banner_widget_path_idx" ON "settings__blocks_banner_widget" USING btree ("_path")`,

  // 6. Widget HTML Tùy chỉnh (customHtmlWidget)
  `CREATE TABLE IF NOT EXISTS "settings__blocks_custom_html_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "html_content" text NOT NULL,
    CONSTRAINT "settings__blocks_custom_html_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_custom_html_widget_order_idx" ON "settings__blocks_custom_html_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_custom_html_widget_parent_idx" ON "settings__blocks_custom_html_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings__blocks_custom_html_widget_path_idx" ON "settings__blocks_custom_html_widget" USING btree ("_path")`,
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (!secret || secret !== process.env.PAYLOAD_SECRET) {
    return new NextResponse('Unauthorized - thêm ?secret=YOUR_PAYLOAD_SECRET vào URL', { status: 401 });
  }

  const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL;
  if (!dbUrl) {
    return NextResponse.json(
      { success: false, error: 'Không tìm thấy DATABASE_URI hoặc POSTGRES_URL trong biến môi trường' },
      { status: 500 }
    );
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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
      : 'Migration hoàn thành! Tất cả bảng sidebarWidgets đã được tạo.',
    results,
  }, { status: hasErrors ? 207 : 200 });
}
