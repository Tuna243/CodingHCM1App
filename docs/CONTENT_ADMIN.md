# Quản lý nội dung

Trang `/admin` cho phép cập nhật:

- Link giáo trình Coding.
- Link tài liệu nhận xét Zalo.

Cấu hình hiện được lưu trong `localStorage` của trình duyệt đang thao tác. Giá trị giáo trình mặc định nằm tại `lib/contentSettings.ts`.

Nếu cần đồng bộ cấu hình cho mọi thiết bị, hãy chuyển lớp lưu trữ sang một dịch vụ server-side như Vercel KV, Postgres hoặc Google Apps Script có xác thực.
