/**
 * MIGRATION STATEMENTS — nguồn duy nhất (single source of truth)
 * Cập nhật lúc: 11/06/2026 23:00
 *
 * Được dùng bởi:
 *   - migrate.mjs  (chạy tự động khi build trên Vercel: `node migrate.mjs && next build`)
 *
 * QUY TẮC:
 *   1. Luôn dùng IF NOT EXISTS / ADD COLUMN IF NOT EXISTS → an toàn khi chạy lại
 *   2. Khi thêm Collection/Global/Field mới → thêm SQL vào cuối danh sách này
 *   3. KHÔNG xóa các statement cũ (chỉ thêm mới)
 *   4. Sau khi thêm SQL → commit & push → Vercel sẽ tự apply khi build
 *
 * QUY TẮC ĐẶT TÊN BẢNG PAYLOAD CMS (drizzle-orm):
 *   Collection slug "my-items"     → "my_items"
 *   Array field "myItems.members"  → "my_items_members"
 *   Relationship field             → "my_items_rels"
 *   Global slug "my-settings"      → "my_settings"
 *   Versions của collection        → "_my_items_v"
 */

export const MIGRATION_STATEMENTS = [

  // ====================================================
  // BATCH 1 – Settings: sidebarWidgets blocks
  // ====================================================
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

  // ====================================================
  // BATCH 2 – main_menu global
  // ====================================================
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

  // ====================================================
  // BATCH 2b – settings table: missing columns
  // ====================================================
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "home_news_layout" varchar DEFAULT 'grid'`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "theme_config_font_family" varchar DEFAULT 'Inter'`,

  // ====================================================
  // BATCH 3 – settings homeSections blocks
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "settings_blocks_news_category_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "category_id" integer,
    "limit" numeric DEFAULT 2,
    "layout" varchar DEFAULT 'grid',
    CONSTRAINT "settings_blocks_news_category_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_news_category_section_order_idx" ON "settings_blocks_news_category_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_news_category_section_parent_idx" ON "settings_blocks_news_category_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_news_category_section_path_idx" ON "settings_blocks_news_category_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_banner_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "image_id" integer,
    "title" varchar,
    "subtitle" varchar,
    "link_url" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "style" varchar DEFAULT 'fullwidth',
    CONSTRAINT "settings_blocks_banner_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_banner_section_order_idx" ON "settings_blocks_banner_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_banner_section_parent_idx" ON "settings_blocks_banner_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_banner_section_path_idx" ON "settings_blocks_banner_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_video_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'VIDEO NỔI BẬT',
    "channel_id" integer,
    "limit" numeric DEFAULT 4,
    "layout" varchar DEFAULT 'grid',
    CONSTRAINT "settings_blocks_video_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_video_section_order_idx" ON "settings_blocks_video_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_video_section_parent_idx" ON "settings_blocks_video_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_video_section_path_idx" ON "settings_blocks_video_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_tiktok_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'KENH TIKTOK CDC DA NANG',
    "channel_id" integer,
    "limit" numeric DEFAULT 4,
    CONSTRAINT "settings_blocks_tiktok_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_tiktok_section_order_idx" ON "settings_blocks_tiktok_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_tiktok_section_parent_idx" ON "settings_blocks_tiktok_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_tiktok_section_path_idx" ON "settings_blocks_tiktok_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_stats_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "background_color" varchar DEFAULT 'primary',
    CONSTRAINT "settings_blocks_stats_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_stats_section_order_idx" ON "settings_blocks_stats_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_stats_section_parent_idx" ON "settings_blocks_stats_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_stats_section_path_idx" ON "settings_blocks_stats_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_stats_section_stats" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "icon" varchar DEFAULT '🏥',
    "value" varchar NOT NULL,
    "label" varchar NOT NULL,
    "suffix" varchar,
    CONSTRAINT "settings_blocks_stats_section_stats_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings_blocks_stats_section" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_stats_section_stats_order_idx" ON "settings_blocks_stats_section_stats" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_stats_section_stats_parent_idx" ON "settings_blocks_stats_section_stats" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_quick_links_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'DICH VU TRUC TUYEN',
    CONSTRAINT "settings_blocks_quick_links_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_quick_links_section_order_idx" ON "settings_blocks_quick_links_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_quick_links_section_parent_idx" ON "settings_blocks_quick_links_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_quick_links_section_path_idx" ON "settings_blocks_quick_links_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_quick_links_section_links" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "icon" varchar DEFAULT '🔗',
    "label" varchar NOT NULL,
    "url" varchar NOT NULL,
    "open_in_new_tab" boolean DEFAULT true,
    "color" varchar DEFAULT 'primary',
    CONSTRAINT "settings_blocks_quick_links_section_links_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings_blocks_quick_links_section" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_quick_links_section_links_order_idx" ON "settings_blocks_quick_links_section_links" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_quick_links_section_links_parent_idx" ON "settings_blocks_quick_links_section_links" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_rich_text_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "content" jsonb,
    CONSTRAINT "settings_blocks_rich_text_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_rich_text_section_order_idx" ON "settings_blocks_rich_text_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_rich_text_section_parent_idx" ON "settings_blocks_rich_text_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_rich_text_section_path_idx" ON "settings_blocks_rich_text_section" USING btree ("_path")`,

  // ====================================================
  // BATCH 4 – form_submissions collection
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "form_submissions" (
    "id" serial PRIMARY KEY NOT NULL,
    "status" varchar DEFAULT 'new',
    "subject" varchar NOT NULL,
    "name" varchar NOT NULL,
    "email" varchar NOT NULL,
    "phone" varchar,
    "organization" varchar,
    "message" text NOT NULL,
    "admin_note" text,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at")`,

  // ====================================================
  // BATCH 5 – pages: new columns + Page Builder blocks
  // ====================================================
  `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "page_type" varchar DEFAULT 'standard'`,
  `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "layout" varchar DEFAULT 'withSidebar'`,
  `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_title" varchar`,
  `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_description" text`,
  `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_og_image_id" integer`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_rich_text_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "content" jsonb,
    CONSTRAINT "pages_blocks_rich_text_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_rich_text_block_order_idx" ON "pages_blocks_rich_text_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_rich_text_block_parent_idx" ON "pages_blocks_rich_text_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_rich_text_block_path_idx" ON "pages_blocks_rich_text_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_section_title_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar NOT NULL,
    "subtitle" varchar,
    "level" varchar DEFAULT 'h2',
    "alignment" varchar DEFAULT 'left',
    "style" varchar DEFAULT 'underline',
    CONSTRAINT "pages_blocks_section_title_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_section_title_block_order_idx" ON "pages_blocks_section_title_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_section_title_block_parent_idx" ON "pages_blocks_section_title_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_section_title_block_path_idx" ON "pages_blocks_section_title_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_card_grid_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "columns" varchar DEFAULT '3',
    "card_style" varchar DEFAULT 'shadow',
    CONSTRAINT "pages_blocks_card_grid_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_block_order_idx" ON "pages_blocks_card_grid_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_block_parent_idx" ON "pages_blocks_card_grid_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_block_path_idx" ON "pages_blocks_card_grid_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_card_grid_block_cards" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "icon" varchar,
    "image_id" integer,
    "title" varchar NOT NULL,
    "description" text,
    "link_url" varchar,
    "link_label" varchar DEFAULT 'Xem them',
    "highlight" boolean DEFAULT false,
    CONSTRAINT "pages_blocks_card_grid_block_cards_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_card_grid_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_block_cards_order_idx" ON "pages_blocks_card_grid_block_cards" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_block_cards_parent_idx" ON "pages_blocks_card_grid_block_cards" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_steps_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "layout" varchar DEFAULT 'vertical',
    CONSTRAINT "pages_blocks_steps_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_steps_block_order_idx" ON "pages_blocks_steps_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_steps_block_parent_idx" ON "pages_blocks_steps_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_steps_block_path_idx" ON "pages_blocks_steps_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_steps_block_steps" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "icon" varchar,
    "title" varchar NOT NULL,
    "description" text,
    "note" varchar,
    CONSTRAINT "pages_blocks_steps_block_steps_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_steps_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_steps_block_steps_order_idx" ON "pages_blocks_steps_block_steps" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_steps_block_steps_parent_idx" ON "pages_blocks_steps_block_steps" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_faq_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'Cau hoi thuong gap',
    CONSTRAINT "pages_blocks_faq_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_faq_block_order_idx" ON "pages_blocks_faq_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_faq_block_parent_idx" ON "pages_blocks_faq_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_faq_block_path_idx" ON "pages_blocks_faq_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_faq_block_faqs" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "question" varchar NOT NULL,
    "answer" text NOT NULL,
    CONSTRAINT "pages_blocks_faq_block_faqs_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_faq_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_faq_block_faqs_order_idx" ON "pages_blocks_faq_block_faqs" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_faq_block_faqs_parent_idx" ON "pages_blocks_faq_block_faqs" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_divider_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "style" varchar DEFAULT 'line',
    "size" varchar DEFAULT 'md',
    CONSTRAINT "pages_blocks_divider_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_divider_block_order_idx" ON "pages_blocks_divider_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_divider_block_parent_idx" ON "pages_blocks_divider_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_divider_block_path_idx" ON "pages_blocks_divider_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_cta_banner_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar NOT NULL,
    "description" text,
    "style" varchar DEFAULT 'primary',
    "background_image_id" integer,
    "primary_button_label" varchar DEFAULT 'Tim hieu them',
    "primary_button_url" varchar,
    "primary_button_open_in_new_tab" boolean DEFAULT false,
    "secondary_button_label" varchar,
    "secondary_button_url" varchar,
    "secondary_button_open_in_new_tab" boolean DEFAULT false,
    CONSTRAINT "pages_blocks_cta_banner_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_cta_banner_block_order_idx" ON "pages_blocks_cta_banner_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_cta_banner_block_parent_idx" ON "pages_blocks_cta_banner_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_cta_banner_block_path_idx" ON "pages_blocks_cta_banner_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_embed_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "embed_type" varchar DEFAULT 'custom',
    "html_code" text,
    "google_maps_url" varchar,
    "facebook_url" varchar,
    "height" numeric DEFAULT 400,
    CONSTRAINT "pages_blocks_embed_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_embed_block_order_idx" ON "pages_blocks_embed_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_embed_block_parent_idx" ON "pages_blocks_embed_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_embed_block_path_idx" ON "pages_blocks_embed_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_table_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "caption" varchar,
    "striped" boolean DEFAULT true,
    "bordered" boolean DEFAULT true,
    CONSTRAINT "pages_blocks_table_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_order_idx" ON "pages_blocks_table_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_parent_idx" ON "pages_blocks_table_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_path_idx" ON "pages_blocks_table_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_table_block_headers" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "label" varchar NOT NULL,
    "align" varchar DEFAULT 'left',
    CONSTRAINT "pages_blocks_table_block_headers_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_table_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_headers_order_idx" ON "pages_blocks_table_block_headers" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_headers_parent_idx" ON "pages_blocks_table_block_headers" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_table_block_rows" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    CONSTRAINT "pages_blocks_table_block_rows_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_table_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_rows_order_idx" ON "pages_blocks_table_block_rows" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_rows_parent_idx" ON "pages_blocks_table_block_rows" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_table_block_rows_cells" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "content" varchar NOT NULL,
    "highlight" boolean DEFAULT false,
    CONSTRAINT "pages_blocks_table_block_rows_cells_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_table_block_rows" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_rows_cells_order_idx" ON "pages_blocks_table_block_rows_cells" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_rows_cells_parent_idx" ON "pages_blocks_table_block_rows_cells" USING btree ("_parent_id")`,

  // ====================================================
  // BATCH 6 – video_channels + videos
  // ====================================================
  `DO $$ BEGIN
    CREATE TYPE "enum_video_channels_platform" AS ENUM('youtube', 'facebook', 'tiktok');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,

  `CREATE TABLE IF NOT EXISTS "video_channels" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "platform" "enum_video_channels_platform" NOT NULL,
    "channel_url" varchar,
    "channel_id" varchar,
    "avatar_id" integer,
    "description" varchar,
    "tiktok_handle" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "video_channels_avatar_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "media"("id") ON DELETE set null ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "video_channels_avatar_idx" ON "video_channels" USING btree ("avatar_id")`,
  `CREATE INDEX IF NOT EXISTS "video_channels_updated_at_idx" ON "video_channels" USING btree ("updated_at")`,
  `CREATE INDEX IF NOT EXISTS "video_channels_created_at_idx" ON "video_channels" USING btree ("created_at")`,

  `ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "channel_id" integer`,
  `ALTER TABLE "videos" DROP CONSTRAINT IF EXISTS "videos_channel_id_fk"`,
  `ALTER TABLE "videos" ADD CONSTRAINT "videos_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "video_channels"("id") ON DELETE set null ON UPDATE no action`,
  `CREATE INDEX IF NOT EXISTS "videos_channel_idx" ON "videos" USING btree ("channel_id")`,

  `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "video_channels_id" integer`,
  `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "form_submissions_id" integer`,
  `ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_video_channels_fk"`,
  `ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_video_channels_fk" FOREIGN KEY ("video_channels_id") REFERENCES "video_channels"("id") ON DELETE cascade ON UPDATE no action`,
  `ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_form_submissions_fk"`,
  `ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "form_submissions"("id") ON DELETE cascade ON UPDATE no action`,
  `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_video_channels_id_idx" ON "payload_locked_documents_rels" USING btree ("video_channels_id")`,
  `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id")`,

  // ====================================================
  // BATCH 7 – users: sessions + rels + new columns
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "users_sessions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
    "id" varchar PRIMARY KEY NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now(),
    "expires_at" timestamp(3) with time zone
  )`,
  `CREATE INDEX IF NOT EXISTS "users_sessions_order_idx" ON "users_sessions" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "users_sessions_parent_idx" ON "users_sessions" USING btree ("_parent_id")`,

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

  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" varchar`,

  // ====================================================
  // BATCH 8 – articles: missing columns
  // ====================================================
  `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "review_status" varchar DEFAULT 'draft'`,
  `ALTER TABLE "_articles_v" ADD COLUMN IF NOT EXISTS "version_review_status" varchar DEFAULT 'draft'`,
  `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "author_name" varchar`,
  `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "views" numeric DEFAULT 0`,

  // ====================================================
  // BATCH 9 – org_units collection
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "org_units" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "unit_type" varchar DEFAULT 'khoa' NOT NULL,
    "order" numeric DEFAULT 99,
    "short_description" varchar,
    "image_id" integer REFERENCES "media"("id") ON DELETE set null,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "org_units_created_at_idx" ON "org_units" USING btree ("created_at")`,

  `CREATE TABLE IF NOT EXISTS "org_units_members" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL REFERENCES "org_units"("id") ON DELETE cascade,
    "id" varchar PRIMARY KEY NOT NULL,
    "member_name" varchar NOT NULL,
    "position" varchar DEFAULT 'nhan_vien' NOT NULL,
    "academic_title" varchar,
    "email" varchar,
    "avatar_id" integer REFERENCES "media"("id") ON DELETE set null,
    "bio" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "org_units_members_order_idx" ON "org_units_members" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "org_units_members_parent_id_idx" ON "org_units_members" USING btree ("_parent_id")`,

  `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "org_units_id" integer`,
  `ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_org_units_fk"`,
  `ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_org_units_fk" FOREIGN KEY ("org_units_id") REFERENCES "org_units"("id") ON DELETE cascade ON UPDATE no action`,
  `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_org_units_id_idx" ON "payload_locked_documents_rels" USING btree ("org_units_id")`,

  // ====================================================
  // BATCH 10 – theme_settings global
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "theme_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "primary_color" varchar DEFAULT '#006C5B',
    "secondary_color" varchar DEFAULT '#004F45',
    "accent_color" varchar DEFAULT '#00A651',
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,

  // ====================================================
  // BATCH 11 – theme_settings: thêm cột org_colors_*
  // Payload CMS tạo tên cột theo pattern: {groupSlug}_{fieldName}
  // group 'orgColors' + field 'ban_lanh_dao' → 'org_colors_ban_lanh_dao'
  // ====================================================
  `ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "org_colors_ban_lanh_dao" varchar DEFAULT '#0d47a1'`,
  `ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "org_colors_phong" varchar DEFAULT '#2e7d32'`,
  `ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "org_colors_khoa" varchar DEFAULT '#1976d2'`,
  `ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "org_colors_khac" varchar DEFAULT '#e65100'`,

  // ====================================================
  // BATCH 12 – ai_settings global
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "ai_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "chat_enabled" boolean DEFAULT true,
    "gemini_api_keys" text,
    "chat_welcome_message" varchar DEFAULT 'Xin chào! Tôi là Trợ lý AI của CDC Đà Nẵng. Tôi có thể giúp gì cho bạn hôm nay?',
    "chat_custom_prompt" text,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,

  // ====================================================
  // BATCH 13 – Add aiChatSettings columns to settings table + department to users
  // ====================================================
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_chat_enabled" boolean DEFAULT true`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_gemini_api_keys" text`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_chat_welcome_message" varchar DEFAULT 'Xin chào! Tôi là Trợ lý AI của CDC Đà Nẵng. Tôi có thể giúp gì cho bạn hôm nay?'`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_chat_custom_prompt" text`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "department" varchar`,

  // ====================================================
  // BATCH 14 – Add auto_zalo_broadcast to articles table
  // ====================================================
  `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "auto_zalo_broadcast" boolean DEFAULT false`,
  `ALTER TABLE "_articles_v" ADD COLUMN IF NOT EXISTS "version_auto_zalo_broadcast" boolean DEFAULT false`,

  // ====================================================
  // BATCH 15 – Documents: thêm trường hiệu lực, lĩnh vực, người ký
  // ====================================================
  `ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "effective_date" timestamp(3) with time zone`,
  `ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "expiry_date" timestamp(3) with time zone`,
  `ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "field" varchar`,
  `ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "signer" varchar`,

  // ====================================================
  // BATCH 16 – Tạo bảng procurements (Thông tin mua sắm)
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "procurements" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "document_number" varchar,
    "procurement_type" varchar NOT NULL DEFAULT 'thu-moi-chao-gia',
    "status" varchar NOT NULL DEFAULT 'open',
    "published_date" timestamp(3) with time zone NOT NULL,
    "deadline" timestamp(3) with time zone,
    "file_id" integer,
    "note" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "procurements_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "media" ("id") ON DELETE set null ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "procurements_published_date_idx" ON "procurements" USING btree ("published_date")`,
  `CREATE INDEX IF NOT EXISTS "procurements_status_idx" ON "procurements" USING btree ("status")`,
  `CREATE INDEX IF NOT EXISTS "procurements_created_at_idx" ON "procurements" USING btree ("created_at")`,

  // ====================================================
  // BATCH 17 – Thêm cột drive_url (Google Drive link)
  // ====================================================
  `ALTER TABLE "procurements" ADD COLUMN IF NOT EXISTS "drive_url" varchar`,
  `ALTER TABLE "documents"    ADD COLUMN IF NOT EXISTS "drive_url" varchar`,

  // ====================================================
  // BATCH 18 – Thêm cột thumbnail_id cho procurements (ảnh đại diện lưới)
  // ====================================================
  `ALTER TABLE "procurements" ADD COLUMN IF NOT EXISTS "thumbnail_id" integer`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'procurements_thumbnail_id_fk') THEN
      ALTER TABLE "procurements" ADD CONSTRAINT "procurements_thumbnail_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "media" ("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;`,

  // ====================================================
  // BATCH 19 – Tạo bảng procedure_groups
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "procedure_groups" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "slug" varchar,
    "order" numeric,
    "icon" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,

  // ====================================================
  // BATCH 20 – Tạo bảng procedures
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "procedures" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "slug" varchar,
    "group_id" integer,
    "status" varchar DEFAULT 'active',
    "published_date" timestamp(3) with time zone NOT NULL,
    "implementation_time" varchar,
    "fee" varchar,
    "result" varchar,
    "requirements" jsonb,
    "file_id" integer,
    "drive_url" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "procedures_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "procedure_groups" ("id") ON DELETE set null ON UPDATE no action,
    CONSTRAINT "procedures_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "media" ("id") ON DELETE set null ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "procedures_group_id_idx" ON "procedures" USING btree ("group_id")`,
  `CREATE INDEX IF NOT EXISTS "procedures_published_date_idx" ON "procedures" USING btree ("published_date")`,
  `CREATE INDEX IF NOT EXISTS "procedures_status_idx" ON "procedures" USING btree ("status")`,

  // ====================================================
  // BATCH 21 – Tạo bảng service_categories
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "service_categories" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "slug" varchar,
    "order" numeric,
    "description" varchar,
    "icon" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,

  // ====================================================
  // BATCH 22 – Tạo bảng services
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "services" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "slug" varchar,
    "category_id" integer,
    "status" varchar DEFAULT 'active',
    "price" varchar,
    "short_description" varchar,
    "content" jsonb,
    "thumbnail_id" integer,
    "booking_url" varchar,
    "contact_phone" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "services_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "service_categories" ("id") ON DELETE set null ON UPDATE no action,
    CONSTRAINT "services_thumbnail_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "media" ("id") ON DELETE set null ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "services_status_idx" ON "services" USING btree ("status")`,

  // ====================================================
  // BATCH 23 – Tạo bảng Global services_landing
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "services_landing" (
    "id" serial PRIMARY KEY NOT NULL,
    "hero_title" varchar,
    "hero_subtitle" varchar,
    "hero_background_image_id" integer,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  )`,
  `CREATE TABLE IF NOT EXISTS "services_landing_features" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" varchar,
    "icon" varchar,
    CONSTRAINT "services_landing_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "services_landing" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE TABLE IF NOT EXISTS "services_landing_process" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" varchar,
    CONSTRAINT "services_landing_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "services_landing" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE TABLE IF NOT EXISTS "services_landing_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" varchar,
    CONSTRAINT "services_landing_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "services_landing" ("id") ON DELETE cascade ON UPDATE no action
  )`,

  // ====================================================
  // BATCH 24 – Cập nhật Payload system rels cho các bảng mới (procurements, procedure_groups, procedures, service_categories, services)
  // ====================================================
  ...['procurements', 'procedure_groups', 'procedures', 'service_categories', 'services'].flatMap(table => [
    `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "${table}_id" integer`,
    `ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_${table}_fk"`,
    `ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_${table}_fk" FOREIGN KEY ("${table}_id") REFERENCES "${table}"("id") ON DELETE cascade ON UPDATE no action`,
    `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_${table}_id_idx" ON "payload_locked_documents_rels" USING btree ("${table}_id")`,

    `ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "${table}_id" integer`,
    `ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT IF EXISTS "payload_preferences_rels_${table}_fk"`,
    `ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_${table}_fk" FOREIGN KEY ("${table}_id") REFERENCES "${table}"("id") ON DELETE cascade ON UPDATE no action`,
    `CREATE INDEX IF NOT EXISTS "payload_preferences_rels_${table}_id_idx" ON "payload_preferences_rels" USING btree ("${table}_id")`
  ]),

  // ====================================================
  // BATCH 25 – Thêm trường icon, color, order_num vào categories
  // ====================================================
  `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "icon" varchar`,
  `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "color" varchar`,
  `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "order_num" numeric DEFAULT 0`,

  // ====================================================
  // BATCH 26 – Thêm group articleReaderTools vào settings
  // ====================================================
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_font_size" boolean`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_t_t_s" boolean`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_share_f_b" boolean`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_share_zalo" boolean`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_google_news" boolean`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_google_news_url" varchar`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_copy_link" boolean`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_print" boolean`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_read_progress" boolean`,

  // ====================================================
  // BATCH 27 – Thêm Collection departments + liên kết vào users
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "departments" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "code" varchar,
    "type" varchar DEFAULT 'phong' NOT NULL,
    "description" varchar,
    "sort_order" numeric DEFAULT 0,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "departments_code_idx" ON "departments" USING btree ("code")`,
  `CREATE INDEX IF NOT EXISTS "departments_created_at_idx" ON "departments" USING btree ("created_at")`,

  `CREATE TABLE IF NOT EXISTS "departments_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "categories_id" integer,
    CONSTRAINT "departments_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "departments" ("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT "departments_rels_categories_fk"
      FOREIGN KEY ("categories_id") REFERENCES "categories" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "departments_rels_order_idx" ON "departments_rels" USING btree ("order")`,
  `CREATE INDEX IF NOT EXISTS "departments_rels_parent_idx" ON "departments_rels" USING btree ("parent_id")`,
  `CREATE INDEX IF NOT EXISTS "departments_rels_path_idx" ON "departments_rels" USING btree ("path")`,

  // Thêm cột department_id vào bảng users (liên kết đến departments)
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "department_id" integer`,
  `ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fk"
    FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE set null ON UPDATE no action`
];
