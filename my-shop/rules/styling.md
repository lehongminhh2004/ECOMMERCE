# Design Aesthetics and Styling Rules

We follow premium design aesthetics for the storefront to create a rich, modern, and interactive user experience. Admin panel styles must remain standard. 

Mọi developer FE cần tuân thủ nghiêm ngặt kỹ năng hiện có và hệ thống layout đã được định nghĩa để đảm bảo tính nhất quán.

## 1. Storefront Styling Rules
- **Color Palettes:** Avoid generic colors (pure red, pure green, generic blue). Use curated, harmonious color palettes (Tailwind theme variables or HSL colors).
- **Typography:** Use modern, readable fonts (e.g., Geist Sans, Geist Mono, Inter) instead of browser defaults.
- **Visual Effects:** - Add smooth gradients (`bg-gradient-to-...`) for hero section or accent headers.
  - Implement dynamic hover effects (`transition-all duration-300`, scale-ups, border highlight) on cards and buttons.
- **Borders & Radius:** Use rounded cards and containers (`rounded-2xl`, `rounded-3xl`) with subtle border lines.
- **Glassmorphism:** Apply backdrop blurs (`backdrop-blur-md bg-background/80`) to floating headers/navigation bars.

## 2. Payload CMS Rules & Style Integrity
- **Cấu trúc Route Groups (Bắt buộc):** Để tránh xung đột Root Layout dẫn đến lỗi Hydration, thư mục `apps/cms/src/app` BẮT BUỘC phải chia thành 2 Route Groups độc lập:
  - `(payload)/`: Dành riêng cho giao diện Admin. Không được chứa Root Layout đè lên file layout mặc định của Payload.
  - `(main)/` (hoặc tên tương đương): Dành cho các trang hiển thị mặc định của CMS. Cặp thẻ `<html>` và `<body>` CHỈ được phép tồn tại trong `(main)/layout.tsx`.
- **Admin Panel Style Integrity:**
  - The Payload CMS admin UI must always include the stylesheet import: `import '@payloadcms/next/css'` inside `apps/cms/src/app/(payload)/layout.tsx`.
  - Do **not** apply custom global Tailwind overrides that break the layout structure or unstyle the standard Payload Admin panel UI.

## 3. Layout & UI Component Standards (Frontend Team)
- **Tận dụng Layout có sẵn:** Mọi trang nội dung mới bắt buộc phải dùng các layout wrapper đã định nghĩa (ví dụ: `Container`, `PageSection`, `SidebarLayout`). Không tự ý tạo thẻ `div` bọc ngoài với width/padding khác biệt làm vỡ grid hệ thống.
- **Chỉ sử dụng Token Design (Tailwind):** - Tuyệt đối không dùng hard-code màu hex/rgb trực tiếp trong class (VD: `text-[#ff5500]`).
  - Chỉ sử dụng các biến CSS đã định nghĩa trong theme của Tailwind/Shadcn (VD: `text-primary`, `bg-secondary`, `border-border`).
- **Giới hạn tính kế thừa CSS:** Hạn chế tối đa việc viết custom CSS bằng thẻ `<style>` hay file `.css`. Mọi style ưu tiên giải quyết thông qua Tailwind Utility Classes.