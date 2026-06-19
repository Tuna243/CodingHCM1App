# Kiến trúc

## Frontend

- Next.js App Router.
- `app/page.tsx` điều phối các màn hình.
- `app/components/Sidebar.tsx` là nguồn điều hướng chính.
- `lib/contentSettings.ts` chứa nội dung mặc định và cấu hình cục bộ từ Admin.

## API

- `GET /api/teachers`: tải CSV Google Sheets phía server, lọc Coding + Active + bốn cơ sở HCM1, sau đó loại bỏ mọi trường nhạy cảm.
- `/api/admin/login`, `/api/admin/logout`, `/api/admin/status`: xác thực bằng cookie HTTP-only ký từ `ADMIN_PASSWORD`.

## Dữ liệu

Ứng dụng không lưu email cá nhân, số điện thoại hoặc dữ liệu HR của giáo viên.
