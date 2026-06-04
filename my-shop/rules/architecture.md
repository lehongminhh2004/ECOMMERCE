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
- **Technologies:** Payload CMS v3, Next.js, Postgres.
- **Responsibilities:** Headless content editor, static marketing pages, blogs, and navigation menus.
- **Boundary:** Do not implement checkout, payment, or transactional ecommerce logic here.

### 3. Storefront (`apps/storefront`)
- **Role:** Client-facing web application.
- **Technologies:** Next.js (App Router), React, Tailwind CSS, Shadcn UI.
- **Responsibilities:** Presents products, integrates Vendure API (Commerce) and Payload CMS API (Content).
- **Boundary:** No direct database connections. Must fetch data via GraphQL or REST.

---

## II. Frontend Architecture & Folder Structure Standards

Để đảm bảo source code của `apps/storefront` nhất quán với cấu trúc hiện tại, team FE áp dụng mô hình tổ chức thư mục theo **Domain-Grouped Components** kết hợp với nguyên tắc Separation of Concerns (Tách biệt logic và giao diện):

### 1. Phân chia Thư mục (Directory Structure)
Mọi file trong thư mục `src/` phải được đặt đúng vị trí theo quy chuẩn sau:

- **`src/app/` (Routing Layer):**
  - Chỉ dùng để định tuyến (Routing), fetch data phía server (Server Components) và truyền dữ liệu (`props`) xuống Client Components.
  - **Tuyệt đối không** viết CSS hay business logic phức tạp tại đây.

- **`src/components/` (Presentation & Domain Layer):**
  - `ui/`: Chứa các Component nguyên thủy, tái sử dụng cao và không có business logic (Dumb Components) như Button, Input, Modal (ví dụ: UI từ Shadcn).
  - `shared/`: Chứa các Component phức tạp hơn nhưng được dùng chung ở nhiều trang (ví dụ: `ProductCard`, `Banner`).
  - `layout/`: Chứa các thành phần cấu trúc khung của trang (Header, Footer, Sidebar).
  - `commerce/`: Chứa các Component đặc thù của nghiệp vụ mua bán (Cart Drawer, Checkout Form, Product Gallery).
  - `account/`: Chứa các Component đặc thù của nghiệp vụ người dùng (Profile Form, Order History).
  - `providers/`: Chứa các file wrappers để khởi tạo React Context (như `ThemeProvider`, `CartProvider`).

- **`src/contexts/` (State Management Layer):**
  - Định nghĩa các React Context để quản lý Global State.

- **`src/hooks/` (Logic Layer):**
  - Chứa toàn bộ custom hooks (`useCart`, `useCheckout`).
  - Nơi đặt business logic và gọi API, giúp component UI giữ được sự "sạch sẽ".

### 2. Nguyên tắc Viết Component (Component Principles)
- **Separation of Concerns:**
  - UI component chỉ nhận `props` và render. Các component trong `commerce/` hay `account/` không tự gọi `fetch` chằng chịt bên trong `useEffect`.
  - Logic xử lý dữ liệu phức tạp phải được đưa ra ngoài và bọc trong một **Custom Hook** (tại `src/hooks/`).
- **Optimistic UI:** Các thao tác tương tác cao (Thêm giỏ hàng, Yêu thích) cần cập nhật state giao diện ngay lập tức trước khi chờ API phản hồi để tạo trải nghiệm mượt mà.

### 3. Quản lý Tích hợp Data
- **Commerce Logic (Vendure):** Sử dụng GraphQL. Khuyến khích dùng `graphql-codegen` để sinh TypeScript types tự động từ schema.
- **Content Logic (PayloadCMS):** Định nghĩa chặt chẽ interfaces/types cho dữ liệu trả về để đồng bộ với các Component render nội dung tĩnh.

---

## III. Quy chuẩn Ngôn ngữ & Bản địa hóa (Language & Localization Rules)

- **Ngôn ngữ mặc định:** Toàn bộ hệ thống website này (bao gồm giao diện hiển thị Storefront, trang quản trị Payload CMS, và danh mục sản phẩm của Vendure Server) mặc định sử dụng duy nhất **tiếng Anh (English / `en`)**.
- **Loại bỏ xử lý đa ngôn ngữ phức tạp:** Trừ khi có yêu cầu cụ thể, các lập trình viên không được tự ý phát triển thêm các tính năng chuyển đổi ngôn ngữ phức tạp khác. Khi gọi API hoặc truy vấn từ Vendure/CMS, luôn truyền mã ngôn ngữ mặc định là `en`.

---

## IV. Đóng gói & Quy tắc Containerization (Docker Rules)

Để phục vụ môi trường Production, Staging và quy trình CI/CD, hệ thống được cấu hình chạy hoàn toàn dưới dạng các container Docker qua Docker Compose:

### 1. Phân chia Services trong Docker Compose
Hệ thống bao gồm các container dịch vụ được điều phối bởi file `docker-compose.yml` ở thư mục gốc:
* **`postgres_db`:** Cơ sở dữ liệu Postgres cho Vendure.
* **`vendure_server`:** Backend xử lý logic nghiệp vụ E-commerce (Port `3000`).
* **`vendure_worker`:** Background worker của Vendure xử lý hàng đợi công việc (Job Queue).
* **`payload_cms`:** CMS Next.js quản trị nội dung (Port `3002`).
* **`storefront`:** Next.js Storefront giao diện người dùng (Port `3001`).

### 2. Quy tắc Lưu trữ Dữ liệu (Named Volumes & Persistence)
Các LLM và nhà phát triển khi viết code hoặc cấu hình hệ thống cần tuân thủ việc lưu trữ dữ liệu bền vững:
* **Vendure Assets:** File ảnh sản phẩm lưu tại `/usr/src/app/apps/server/static/assets` được gắn với volume `vendure_assets`.
* **CMS Media:** Ảnh upload từ CMS lưu tại `/usr/src/app/apps/cms/media` được gắn với volume `cms_media`.
* **Database (PostgreSQL):** Cả Vendure và Payload CMS đều sử dụng chung cơ sở dữ liệu Postgres (`postgres_db`) để quản lý dữ liệu tập trung. Dữ liệu Postgres được lưu tại `/var/lib/postgresql/data` và gắn với volume `postgres_db_data` (được ánh xạ ngoài qua volume `server_postgres_db_data` chứa catalog sản phẩm cũ).

### 3. Tối ưu hóa Build Image (Next.js Standalone)
* Hai ứng dụng Next.js (`apps/storefront` và `apps/cms`) **BẮT BUỘC** phải bật tính năng standalone build (`output: 'standalone'` trong `next.config.ts`).
* Điều này giúp trình biên dịch Next.js chỉ gom các file thực thi cần thiết vào thư mục `.next/standalone`, ngăn chặn việc copy toàn bộ `node_modules` khổng lồ của monorepo vào Docker Image, giảm dung lượng image từ hàng GB xuống chỉ còn vài chục MB.

### 4. Kết nối mạng (Networking)
* Khi cấu hình biến môi trường kết nối giữa các dịch vụ phía Server-side (RSC, SSR) chạy bên trong mạng Docker, bắt buộc dùng **Service Name** (ví dụ: `http://vendure_server:3000/...` hoặc `http://payload_cms:3002/...`) thay vì `localhost`.
* Đối với mã chạy phía Client-side (Trình duyệt của khách hàng), vẫn sử dụng `localhost` hoặc địa chỉ IP public của Host.