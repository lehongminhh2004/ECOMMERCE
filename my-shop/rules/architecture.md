# System Architecture & Clean Code Rules

This project is a full-stack e-commerce monorepo using npm workspaces. The code is organized into independent packages under `apps/` with clear roles and strict boundaries.

## I. Component Roles

### 1. Vendure Server (`apps/server`)
- **Role:** Core E-Commerce engine.
- **Technologies:** Node.js, GraphQL, TypeORM, Postgres.
- **Responsibilities:** Manages catalog, customer accounts, carts, checkouts, and integrations.
- **Boundary:** Must not contain any frontend storefront layout, blogging features, or static content pages.

### 2. Payload CMS (`apps/cms`)
- **Role:** Content Management System.
- **Technologies:** Payload CMS v3, Next.js, SQLite (hoặc Postgres).
- **Responsibilities:** Headless content editor, static marketing pages, blogs, and navigation menus.
- **Boundary:** Do not implement checkout, payment, or transactional ecommerce logic here.

### 3. Storefront (`apps/storefront`)
- **Role:** Client-facing web application.
- **Technologies:** Next.js (App Router), React, Tailwind CSS, Shadcn UI.
- **Responsibilities:** Presents products, integrates Vendure API (Commerce) and Payload CMS API (Content).
- **Boundary:** No direct database connections. Must fetch data via GraphQL or REST.

---

## II. Frontend Clean Architecture Standards

Để đảm bảo source code của `apps/storefront` dễ bảo trì và test, team FE áp dụng Clean Architecture được "React-hóa":

### 1. Phân tách Lớp (Layer Separation)
Kiến trúc thư mục chia theo **Domain/Feature** thay vì loại file:
- **`app/` (Routing Layer):** Chỉ định tuyến, fetch data phía server (RSC) và truyền dữ liệu. Không viết business logic.
- **`components/ui/` (Shared Presentation Layer):** Chứa các Dumb Components (Button, Input, Modal). Không chứa logic gọi API.
- **`features/` (Domain Layer):** Gom cụm theo tính năng (VD: `cart/`, `product/`). Mỗi feature chứa:
  - `components/`: Smart Components đặc thù của tính năng.
  - `hooks/`: Business logic, state management (VD: `useCart.ts`).
  - `api/`: Các service/hàm gọi API riêng cho tính năng đó.
- **`lib/` & `utils/`:** Helper functions (format tiền, ngày tháng) và cấu hình core client.

### 2. Nguyên tắc Viết Component (Component Principles)
- **Separation of Concerns:** UI component chỉ nhận `props` và render. Logic xử lý dữ liệu phức tạp, gọi API phải bọc trong **Custom Hook**. 
  - *Ví dụ:* Component `ProductCard` nhận data qua props, không tự gọi fetch data bằng `useEffect` bên trong nó.
- **Optimistic UI:** Các thao tác tương tác cao (Thêm giỏ hàng, Yêu thích) cần cập nhật state giao diện ngay lập tức trước khi chờ API phản hồi để tạo trải nghiệm mượt mà.

### 3. Quản lý Tích hợp Data
- **Commerce Logic (Vendure):** Sử dụng GraphQL. Khuyến khích dùng `graphql-codegen` để sinh TypeScript types tự động từ schema.
- **Content Logic (PayloadCMS):** Định nghĩa chặt chẽ interfaces/types cho dữ liệu trả về để đồng bộ với các Component render nội dung tĩnh.