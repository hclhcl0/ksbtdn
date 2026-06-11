# Quy trình sửa lỗi Vercel Runtime — Payload CMS + Next.js

> **Áp dụng cho**: Dự án `ksbtdn` — Next.js 15 + Payload CMS 3 + PostgreSQL (Prisma DB)
> **Tình huống**: Sau khi thêm block/collection mới vào CMS, website Vercel báo lỗi 500

---

## 1. Kiểm tra log Vercel

### 1.1 Cài Vercel CLI (nếu chưa có)

```bash
npm i -g vercel
vercel login
```

### 1.2 Liên kết project (chạy một lần trong thư mục dự án)

```bash
cd next-frontend
vercel link
```

### 1.3 Xem danh sách deployments

```bash
npx vercel ls
```

Output mẫu:
```
Age     Project      Deployment URL                                    Status
6m      ksbtdn       https://ksbtdn-ggqtikn25-hclhcl0s...vercel.app   Ready
1d      ksbtdn       https://ksbtdn-byt0ga76c-hclhcl0s...vercel.app   Error
```

### 1.4 Xem log lỗi

```bash
# Xem lỗi 500 với đầy đủ thông tin (JSON)
npx vercel logs --level error --expand --limit 20 --json 2>&1

# Xem log real-time (stream)
npx vercel logs --follow
```

> Log chứa trường `[cause]` cho biết lỗi gốc, ví dụ:
> `error: relation "settings_blocks_news_category_section" does not exist`

---

## 2. Phân tích lỗi thường gặp

### Lỗi 1: `relation "..." does not exist` (Error code 42P01)

**Nguyên nhân**: Schema CMS đã thêm block/collection mới nhưng database production chưa có table tương ứng.

**Tại sao xảy ra với Vercel?**
Payload CMS dùng `push: true` để tự tạo table, nhưng trên Vercel (serverless) quá trình này **không chạy được** do:
- Timeout ngắn của function
- Không có quyền DDL trong một số cấu hình

**Giải pháp**: Chạy SQL migration thủ công trực tiếp vào DB production.

---

### Lỗi 2: `column "..." does not exist` (Error code 42703)

**Nguyên nhân**: Field mới thêm vào collection/global hiện có, nhưng chưa có column trong DB.

**Giải pháp**: Chạy `ALTER TABLE "ten_bang" ADD COLUMN IF NOT EXISTS "ten_cot" kieu_du_lieu`.

---

### Canh bao: `SECURITY Warning`

Đây là warning từ Node.js về SSL certificate, **không gây lỗi 500**, có thể bỏ qua.

---

## 3. Xác định bảng còn thiếu

### 3.1 Quy tắc đặt tên bảng của Payload CMS (PostgreSQL)

| Loại | Cấu trúc tên bảng |
|---|---|
| Collection `my-collection` | `my_collection` |
| Global `myGlobal` | `my_global` |
| Block `myBlock` trong collection | `collection_blocks_my_block` |
| Block `myBlock` trong global | `global_blocks_my_block` |
| Array/sub-table trong block | `collection_blocks_my_block_array_name` |

**Ví dụ thực tế** (dự án này):

| Block slug trong code | Tên bảng DB |
|---|---|
| `newsCategorySection` (global Settings) | `settings_blocks_news_category_section` |
| `statsSection` | `settings_blocks_stats_section` |
| `stats` (array bên trong statsSection) | `settings_blocks_stats_section_stats` |
| `faqBlock` (collection Pages) | `pages_blocks_faq_block` |
| `faqs` (array bên trong faqBlock) | `pages_blocks_faq_block_faqs` |

### 3.2 Đọc lỗi từ log để biết bảng nào thiếu

```
[cause]: error: relation "settings_blocks_news_category_section" does not exist
```
Cần tạo bảng `settings_blocks_news_category_section`

---

## 4. Viết SQL Migration

### 4.1 Template tạo bảng block mới

```sql
-- Bảng chính của block
CREATE TABLE IF NOT EXISTS "global_blocks_ten_block" (
  "id" serial PRIMARY KEY NOT NULL,
  "_order" integer NOT NULL,          -- thứ tự block trong danh sách
  "_parent_id" integer NOT NULL,      -- ID của bảng cha (global.id)
  "_path" text NOT NULL,              -- đường dẫn nếu block lồng nhau
  "block_name" varchar,               -- tên block tùy chọn
  -- Các field của block:
  "ten_field" varchar,
  "so_luong" numeric DEFAULT 5,
  "kieu" varchar DEFAULT 'grid',
  CONSTRAINT "global_blocks_ten_block_parent_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "ten_global" ("id")
    ON DELETE cascade ON UPDATE no action
);

-- 3 Index bắt buộc (Payload yêu cầu)
CREATE INDEX IF NOT EXISTS "global_blocks_ten_block_order_idx"
  ON "global_blocks_ten_block" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "global_blocks_ten_block_parent_idx"
  ON "global_blocks_ten_block" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "global_blocks_ten_block_path_idx"
  ON "global_blocks_ten_block" USING btree ("_path");
```

### 4.2 Template tạo sub-table (array bên trong block)

```sql
CREATE TABLE IF NOT EXISTS "global_blocks_ten_block_items" (
  "id" serial PRIMARY KEY NOT NULL,
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,   -- trỏ vào global_blocks_ten_block.id
  "label" varchar NOT NULL,
  "url" varchar NOT NULL,
  CONSTRAINT "global_blocks_ten_block_items_parent_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "global_blocks_ten_block" ("id")
    ON DELETE cascade ON UPDATE no action
);
CREATE INDEX IF NOT EXISTS "global_blocks_ten_block_items_order_idx"
  ON "global_blocks_ten_block_items" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "global_blocks_ten_block_items_parent_idx"
  ON "global_blocks_ten_block_items" USING btree ("_parent_id");
-- Sub-table KHONG can "_path" index
```

### 4.3 Template thêm column vào bảng hiện có

```sql
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "page_type" varchar DEFAULT 'standard';
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_title" varchar;
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_og_image_id" integer;
```

### 4.4 Kiểu dữ liệu hay dùng

| Payload field type | PostgreSQL type |
|---|---|
| `text`, `select`, `radio` | `varchar` |
| `textarea` | `text` |
| `richText` (Lexical) | `jsonb` |
| `number` | `numeric` |
| `checkbox` | `boolean DEFAULT false` |
| `date` | `timestamp(3) with time zone` |
| `upload` (ảnh) | `integer` (FK tới `media.id`) |
| `relationship` | `integer` (FK tới bảng kia) |

---

## 5. Chạy migration vào DB production

### 5.1 Lấy DATABASE_URL

- Vào https://vercel.com → Project → Settings → Environment Variables
- Copy giá trị `DATABASE_URL` hoặc `POSTGRES_URL`
- Hoặc lấy từ nhà cung cấp DB (Prisma Data Platform, Neon, Supabase...)

### 5.2 Tạo script migration tạm

Tạo file `scratch/run-migration.mjs` **(KHÔNG commit lên git)**:

```js
import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = "postgres://USER:PASS@HOST/DB?sslmode=require";

const MIGRATION_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "ten_bang" (...)`,
  `CREATE INDEX IF NOT EXISTS "ten_index" ON ...`,
];

async function run() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const client = await pool.connect();
  let ok = 0, skipped = 0, errors = 0;
  try {
    for (const sql of MIGRATION_STATEMENTS) {
      const label = sql.trim().replace(/\s+/g, ' ').substring(0, 80);
      try {
        await client.query(sql);
        console.log(`OK: ${label}`);
        ok++;
      } catch (err) {
        if (err.code === '42P07' || err.message?.includes('already exists')) {
          console.log(`SKIP: ${label}`);
          skipped++;
        } else {
          console.error(`ERR [${err.code}]: ${err.message}`);
          errors++;
        }
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
  console.log(`\nOK: ${ok} | Skip: ${skipped} | Loi: ${errors}`);
  if (errors > 0) process.exit(1);
}

run();
```

### 5.3 Chạy script

```bash
node scratch/run-migration.mjs
```

Kết quả mong đợi:
```
OK: CREATE TABLE IF NOT EXISTS "settings_blocks_news_category_section"...
OK: CREATE INDEX IF NOT EXISTS "settings_blocks_news_category_section_order_idx"...
...
OK: 126 | Skip: 0 | Loi: 0
```

### 5.4 Xóa file ngay sau khi chạy xong

**QUAN TRONG**: File chứa DATABASE_URL — KHONG commit lên git!

```powershell
Remove-Item scratch\run-migration.mjs
```

---

## 6. Redeploy lên Vercel

### Cách 1 — Tự động qua GitHub (khuyến nghị)

```bash
git add -A
git commit -m "fix: add missing DB tables for new blocks"
git push origin master
```

Vercel tự detect push và build lại.

### Cách 2 — Thủ công qua CLI

```bash
npx vercel --prod
```

---

## 7. Xác nhận sửa xong

### 7.1 Kiểm tra log sau deploy

```bash
npx vercel logs --level error --limit 10
```

Nếu không còn `relation "..." does not exist` → OK.

### 7.2 Test trên trình duyệt

```
https://ksbtdn.vercel.app        → Trang chủ
https://ksbtdn.vercel.app/admin  → Payload Admin
```

---

## 8. Checklist mỗi khi thêm block/collection mới

```
[ ] 1. Thêm block/collection vào code CMS (Payload config)
[ ] 2. Chạy npm run dev local → kiểm tra hoạt động trên DB local
[ ] 3. Xác định tên bảng DB theo quy tắc đặt tên Payload
[ ] 4. Thêm SQL vào MIGRATION_STATEMENTS trong src/app/api/db-push/route.ts
[ ] 5. git push → chờ Vercel build xong
[ ] 6. Lấy DATABASE_URL production
[ ] 7. Tạo scratch/run-migration.mjs → node scratch/run-migration.mjs
[ ] 8. Xóa file migration (bảo mật)
[ ] 9. Chạy: npx vercel logs --level error --limit 10
[ ] 10. Test trang web production
```

---

## 9. Ghi chú kỹ thuật

### Tại sao `push: true` không hoạt động trên Vercel?

Payload CMS dùng Drizzle ORM với `push: true` để sync schema.
Trên Vercel serverless:
- Mỗi request là cold start mới
- Drizzle push cần kết nối lâu + quyền DDL → thường timeout sau 10-30s

**Workaround**: Dùng migration SQL thủ công hoặc API route `/api/db-push`

### Route `/api/db-push` trong dự án

```
GET https://ksbtdn.vercel.app/api/db-push?secret=PAYLOAD_SECRET
```

Route này chạy tất cả SQL trong `MIGRATION_STATEMENTS` và trả về JSON kết quả.
Cần truyền `secret` để bảo mật.

### Relationship field — 2 trường hợp

```sql
-- Quan hệ đơn (1 collection)
"category_id" integer   -- chỉ lưu ID

-- Quan hệ đa hình (nhiều collection)
"related_doc_id" integer
"related_doc_rel" varchar   -- lưu tên collection
```

---

*Tài liệu này được tạo từ thực tế debug dự án CDC Da Nang — 11/06/2026*
