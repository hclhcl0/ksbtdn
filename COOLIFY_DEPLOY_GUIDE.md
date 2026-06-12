# Hướng dẫn Deploy Next.js + Payload CMS v3 lên Coolify

Dự án này hoàn toàn có thể deploy lên **Coolify** (một giải pháp Self-Hosted PaaS thay thế tuyệt vời cho Vercel/Heroku). Việc deploy lên Coolify giúp bạn toàn quyền kiểm soát máy chủ, dữ liệu và tiết kiệm chi phí so với Vercel.

Dưới đây là các bước chi tiết để deploy dự án lên Coolify.

---

## Bước 1: Tạo Database PostgreSQL trên Coolify

Payload CMS cần một cơ sở dữ liệu để lưu trữ thông tin. Trên Coolify, bạn có thể tạo một Database Postgres chỉ với vài cú click:

1. Vào dashboard Coolify của bạn.
2. Chọn **Sources** hoặc **Projects** -> Chọn dự án của bạn -> Click **New Resource**.
3. Chọn **PostgreSQL** từ danh sách dịch vụ.
4. Điền tên Database (ví dụ: `cdc-database`) và cấu hình (để mặc định).
5. Click **Deploy**.
6. Sau khi deploy thành công, vào tab **Instructions** hoặc **Environment Variables** của Postgres vừa tạo để lấy **Internal Connection String** (Chuỗi kết nối nội bộ, ví dụ: `postgresql://postgres:password@postgresql:5432/postgres`).

---

## Bước 2: Tạo Application mới từ GitHub

1. Trong dự án của bạn trên Coolify, click **New Resource** -> Chọn **Public Repository** hoặc **Private Repository** (nếu bạn liên kết GitHub với Coolify).
2. Dán link GitHub repository của bạn (ví dụ: `https://github.com/hclhcl0/ksbtdn`).
3. Chọn nhánh `master` hoặc nhánh bạn muốn deploy.
4. Ở phần **Build Pack**, Coolify sẽ tự động nhận diện dự án là Next.js bằng **Nixpacks** (hoặc bạn có thể chọn Nixpacks thủ công).
   * *Nixpacks sẽ tự động phát hiện `package.json` và chạy lệnh build: `npm run build` & start: `npm run start`.*
5. Điền đường dẫn thư mục nguồn (Source Directory) nếu repo của bạn chứa dự án ở thư mục con (ví dụ: `/next-frontend` nếu cấu trúc repo có thư mục này ở root, hoặc `/` nếu dự án nằm trực tiếp ở root repo). Trong cấu trúc repo của bạn, nếu dự án nằm ở thư mục root thì điền `/`.

---

## Bước 3: Cấu hình biến môi trường (Environment Variables)

Vào tab **Environment Variables** của Application trên Coolify và thêm các biến môi trường sau:

| Biến môi trường | Giá trị | Ghi chú |
| :--- | :--- | :--- |
| `DATABASE_URI` | `postgresql://...` | Dán chuỗi kết nối PostgreSQL lấy từ **Bước 1**. |
| `PAYLOAD_SECRET` | `chuoi-bi-mat-cua-ban` | Một chuỗi ngẫu nhiên bảo mật dùng để mã hóa session của Payload. |
| `NEXT_PUBLIC_SERVER_URL` | `https://your-domain.com` | Tên miền của bạn được cấu hình trên Coolify. |
| `NODE_ENV` | `production` | Bắt buộc để tối ưu hiệu năng chạy Next.js. |
| `PAYLOAD_FORCE_PUSH` | `false` | Nên để `false`. Cơ chế migration tự động qua `migrate.mjs` sẽ cập nhật DB khi deploy. |

---

## Bước 4: Cấu hình Volume lưu trữ Media (Quan trọng)

Nếu bạn không sử dụng các dịch vụ Cloud Storage (như Vercel Blob thông qua biến `BLOB_READ_WRITE_TOKEN` hay AWS S3, Cloudflare R2...), các file hình ảnh/tài liệu tải lên website sẽ được lưu trực tiếp vào thư mục local `media/` của dự án. 

Vì các container Docker trên Coolify là tạm thời (dữ liệu trong container sẽ mất khi deploy bản mới hoặc restart), bạn **bắt buộc phải cấu hình Volume lưu trữ** để không bị mất ảnh:

1. Vào tab **Storage** (hoặc **Persistent Volumes**) của Application trên Coolify.
2. Thêm một Volume mới:
   * **Path inside container**: `/app/media` (hoặc `/app/next-frontend/media` tùy thuộc vào thư mục làm việc của Docker - mặc định Nixpacks là `/app/media`).
   * **Volume Name**: đặt tên gợi nhớ, ví dụ: `cdc-media-volume`.
3. Click **Save** và khởi động lại Application.

*Nếu bạn đã cấu hình `BLOB_READ_WRITE_TOKEN` trong Environment Variables để dùng Vercel Blob, bạn có thể bỏ qua bước cấu hình Volume này.*

---

## Bước 5: Cấu hình Tên miền (Domain) và SSL

1. Trong tab **General** của Application trên Coolify, cuộn xuống phần **Domains**.
2. Điền tên miền của bạn (ví dụ: `https://cdc.danang.gov.vn` hoặc `https://test.yourdomain.com`).
3. Coolify sẽ tự động cấu hình Reverse Proxy (Traefik) và tự động cấp chứng chỉ bảo mật SSL miễn phí (Let's Encrypt) cho tên miền của bạn.

---

## Bước 6: Deploy!

1. Click nút **Deploy** ở góc phải màn hình Coolify.
2. Quá trình deploy sẽ tự động chạy:
   * Tải code từ GitHub về.
   * Chạy script `node migrate.mjs` (nằm trong script build của bạn) để tự động tạo bảng/cột mới trong database Postgres vừa tạo ở Bước 1.
   * Build Next.js app.
   * Khởi động server Node.js.
3. Khi status chuyển sang `Running (Healthy)`, trang web của bạn đã online! Bạn có thể truy cập `/admin` để vào trang quản trị CMS.
