// Test migration script - chạy bằng: node test-migration.mjs
import pkg from 'pg';
const { Pool } = pkg;

const dbUrl = 'postgres://postgres:123456@127.0.0.1:5433/webcq';

const MIGRATION_STATEMENTS = [
  // 1. Widget Chuyên mục
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

  // 2. Widget Bài viết mới nhất
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

  // 3. Widget TikTok
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

  // 4. Widget Facebook
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

  // 5. Widget Banner
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

  // 6. Widget HTML tùy chỉnh
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

const pool = new Pool({ connectionString: dbUrl });

let ok = 0, skipped = 0, errors = 0;

try {
  const client = await pool.connect();
  try {
    for (const sql of MIGRATION_STATEMENTS) {
      const label = sql.trim().replace(/\s+/g, ' ').substring(0, 80);
      try {
        await client.query(sql);
        console.log('✅ OK:', label);
        ok++;
      } catch (err) {
        if (err.code === '42P07' || err.message?.includes('already exists')) {
          console.log('⏭  SKIP:', label);
          skipped++;
        } else {
          console.error('❌ ERR:', label, '->', err.message);
          errors++;
        }
      }
    }
  } finally {
    client.release();
  }
} finally {
  await pool.end();
}

console.log(`\n📊 Kết quả: ✅ ${ok} thành công | ⏭ ${skipped} đã tồn tại | ❌ ${errors} lỗi`);
if (errors > 0) process.exit(1);
