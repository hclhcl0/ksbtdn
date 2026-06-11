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

  // =====================================================
  // FIX 2b: settings table — missing columns for new fields
  // =====================================================
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "home_news_layout" varchar DEFAULT 'grid'`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "theme_config_font_family" varchar DEFAULT 'Inter'`,

  // =====================================================
  // FIX 3: settings homeSections blocks
  // =====================================================

  // 3a. newsCategorySection
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

  // 3b. bannerSection
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

  // 3c. videoSection
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

  // 3d. tiktokSection
  `CREATE TABLE IF NOT EXISTS "settings_blocks_tiktok_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'KÊNH TIKTOK CDC ĐÀ NẴNG',
    "channel_id" integer,
    "limit" numeric DEFAULT 4,
    CONSTRAINT "settings_blocks_tiktok_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_tiktok_section_order_idx" ON "settings_blocks_tiktok_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_tiktok_section_parent_idx" ON "settings_blocks_tiktok_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_tiktok_section_path_idx" ON "settings_blocks_tiktok_section" USING btree ("_path")`,

  // 3e. statsSection
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

  // 3f. quickLinksSection
  `CREATE TABLE IF NOT EXISTS "settings_blocks_quick_links_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'DỊCH VỤ TRỰC TUYẾN',
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

  // 3g. richTextSection
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

  // =====================================================
  // FIX 4: form_submissions collection
  // =====================================================
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

  // =====================================================
  // FIX 5: pages collection new fields
  // =====================================================
  `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "page_type" varchar DEFAULT 'standard'`,
  `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "layout" varchar DEFAULT 'withSidebar'`,
  `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_title" varchar`,
  `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_description" text`,
  `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_og_image_id" integer`,

  // =====================================================
  // FIX 6: pages blocks - new Page Builder blocks
  // =====================================================

  // richTextBlock
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

  // sectionTitleBlock
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

  // cardGridBlock
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
    "link_label" varchar DEFAULT 'Xem thêm',
    "highlight" boolean DEFAULT false,
    CONSTRAINT "pages_blocks_card_grid_block_cards_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_card_grid_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_block_cards_order_idx" ON "pages_blocks_card_grid_block_cards" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_block_cards_parent_idx" ON "pages_blocks_card_grid_block_cards" USING btree ("_parent_id")`,

  // stepsBlock
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

  // faqBlock
  `CREATE TABLE IF NOT EXISTS "pages_blocks_faq_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'Câu hỏi thường gặp',
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

  // dividerBlock
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

  // ctaBannerBlock
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
    "primary_button_label" varchar DEFAULT 'Tìm hiểu thêm',
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

  // embedBlock
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

  // tableBlock
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
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (!secret || secret !== process.env.PAYLOAD_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.DATABASE_URI;
  if (!dbUrl) {
    return new NextResponse('Missing DB URL in environment', { status: 500 });
  }

  const action = searchParams.get('action');
  if (action === 'get-url') {
    return new NextResponse(dbUrl, { status: 200 });
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
