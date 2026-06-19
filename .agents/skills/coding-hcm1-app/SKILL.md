---
name: coding-hcm1-app
description: Maintain the Coding HCM1 Next.js teaching hub, including teacher filtering, light UI, admin-managed content links, navigation, testing, and deployment.
---

# Coding HCM1 App

## Khi sử dụng

Dùng skill này khi sửa điều hướng, dữ liệu giáo viên, tài liệu Coding, trang Admin, giao diện hoặc cấu hình deploy.

## Quy trình

1. Đọc `AGENTS.md` và các file liên quan trực tiếp.
2. Kiểm tra dữ liệu đầu vào có chứa trường nhạy cảm hay không.
3. Giữ bộ lọc giáo viên: Coding, Active, bốn cơ sở HCM1.
4. Giữ giao diện sáng với màu sky/cyan và độ tương phản WCAG.
5. Không thêm lại các tab Nhận xét, Nhận mail chỉ số, Bài tập về nhà, Đánh giá năng lực, Đào tạo nâng cao.
6. Chạy lint và build.
7. Kiểm tra giao diện desktop/mobile bằng trình duyệt.

## Điểm kiểm soát

- `app/api/teachers/route.ts`: không được trả dữ liệu ngoài `name`, `code`, `center`.
- `app/components/Sidebar.tsx`: nguồn điều hướng.
- `lib/contentSettings.ts`: link mặc định.
- `ADMIN_PASSWORD`: chỉ tồn tại trong environment variables.
