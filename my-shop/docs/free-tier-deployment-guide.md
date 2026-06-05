# Free-Tier Deployment Guide

Hướng dẫn này dùng cho project cá nhân/demo với chi phí 0đ. Mục tiêu là chạy được hệ thống, chấp nhận cold start và giới hạn free-tier.

## 1. Stack Triển Khai

- Storefront: Vercel Hobby.
- Vendure Server + Worker: Render Free Web Service.
- Payload CMS: Render Free Web Service.
- Database: Neon Free hoặc Supabase Free.
- Media: Cloudinary Free.
- CI/CD: GitHub Actions free.

## 2. Chuẩn Bị Tài Khoản

Tạo các tài khoản miễn phí:

1. GitHub.
2. Vercel.
3. Render.
4. Neon hoặc Supabase.
5. Cloudinary.

## 3. Database

Tạo một Postgres database trên Neon hoặc Supabase.

Với project cá nhân, có thể dùng chung một database cho Vendure và Payload để tiết kiệm. Nếu provider cho phép, nên tách schema:

- `public` hoặc `vendure` cho Vendure.
- `payload` cho Payload.

Nếu chưa tách schema, dùng chung `public` vẫn chấp nhận được cho demo, nhưng không khuyến nghị cho production thật.

## 4. Render — Vendure Và Payload

Repo đã có `render.yaml` ở root repository.

### 4.1 Deploy Bằng Render Blueprint

1. Vào Render Dashboard.
2. Chọn New > Blueprint.
3. Kết nối GitHub repo.
4. Render sẽ đọc `render.yaml`.
5. Tạo 2 services:
   - `my-shop-vendure`
   - `my-shop-payload-cms`

### 4.2 Biến Môi Trường Vendure

Set trong Render service `my-shop-vendure`:

- `DATABASE_URL`
- `DB_SSL=true`
- `DB_SCHEMA=public`
- `DB_SYNCHRONIZE=false`
- `VENDURE_DB_POOL_MAX=6`
- `RUN_WORKER_IN_PROCESS=true`
- `COOKIE_SECRET`
- `SUPERADMIN_USERNAME`
- `SUPERADMIN_PASSWORD`
- `ASSET_URL_PREFIX=https://your-vendure-render-url.onrender.com/assets`

### 4.3 Biến Môi Trường Payload

Set trong Render service `my-shop-payload-cms`:

- `DATABASE_URI`
- `DB_SSL=true`
- `DB_PUSH=true`
- `PAYLOAD_DB_POOL_MAX=4`
- `PAYLOAD_SECRET`
- `STOREFRONT_REVALIDATE_URL=https://your-vercel-storefront.vercel.app/api/revalidate`
- `REVALIDATION_SECRET`

## 5. Vercel — Storefront

### 5.1 Project Settings

Khi import repo vào Vercel:

- Root Directory: `my-shop/apps/storefront`
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

Nếu Vercel không install đúng dependency do monorepo, đổi Root Directory thành `my-shop` và dùng:

- Build Command: `npm run build -w storefront`
- Output Directory: `apps/storefront/.next`

### 5.2 Biến Môi Trường Storefront

Set trong Vercel:

- `VENDURE_SHOP_API_URL=https://your-vendure-render-url.onrender.com/shop-api`
- `NEXT_PUBLIC_VENDURE_SHOP_API_URL=https://your-vendure-render-url.onrender.com/shop-api`
- `PAYLOAD_API_URL=https://your-payload-render-url.onrender.com/api`
- `NEXT_PUBLIC_PAYLOAD_API_URL=https://your-payload-render-url.onrender.com/api`
- `NEXT_PUBLIC_SITE_URL=https://your-vercel-storefront.vercel.app`
- `NEXT_PUBLIC_SITE_NAME=my-shop`
- `VENDURE_CHANNEL_TOKEN=__default_channel__`
- `REVALIDATION_SECRET`

## 6. Cloudinary

Hiện code đã cho phép Storefront hiển thị ảnh từ `res.cloudinary.com`.

Bước triển khai tối thiểu:

1. Upload ảnh thủ công lên Cloudinary.
2. Dùng Cloudinary URL trong nội dung CMS nếu cần demo nhanh.
3. Với Vendure/Payload upload tự động, cần triển khai storage adapter riêng ở phase sau.

Không nên lưu ảnh quan trọng trên filesystem của Render Free vì service có thể bị reset.

## 7. Sau Khi Deploy

### 7.1 Chạy Migration Vendure

Trên Render Shell của service Vendure:

```bash
node apps/server/dist/index.js --run-migrations
```

Sau đó restart service.

### 7.2 Rebuild Search Index

Sau khi dữ liệu Vendure ổn định, chạy lại reindex bằng Admin API:

```graphql
mutation {
  reindex {
    id
  }
}
```

## 8. Smoke Test

Kiểm tra các URL:

- `https://your-vendure-render-url.onrender.com/health`
- `https://your-vendure-render-url.onrender.com/dashboard`
- `https://your-payload-render-url.onrender.com/admin`
- `https://your-vercel-storefront.vercel.app/en`
- `https://your-vercel-storefront.vercel.app/vi`

Kiểm tra nghiệp vụ:

- `/en` hiển thị USD.
- `/vi` hiển thị VND.
- Product list có sản phẩm.
- Product detail có giá đúng.
- CMS content đổi theo locale nếu đã nhập bản dịch.
- Payload/Vendure API không báo lỗi DB connection.

## 9. CI/CD Gợi Ý Cho Sinh Viên

Giữ đơn giản:

1. Pull request vào `develop`: chạy lint, typecheck, build.
2. Push `develop`: deploy staging nếu có staging.
3. Push `main`: deploy production.

Với project cá nhân, có thể bỏ staging để tiết kiệm thời gian:

- PR vào `main`: CI.
- Merge vào `main`: Vercel/Render auto deploy.

## 10. Giới Hạn Cần Chấp Nhận

- Render Free có cold start.
- Vendure worker gộp chung server chỉ phù hợp 1 instance.
- `DB_PUSH=true` cho Payload tiện demo, nhưng production thật nên dùng migration.
- Cloudinary automatic upload chưa hoàn tất nếu chưa có adapter.
- Free-tier có thể bị pause nếu vượt quota.
