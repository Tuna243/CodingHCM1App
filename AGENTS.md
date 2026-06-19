# Coding HCM1 Agent Guide

## Mục tiêu

Duy trì ứng dụng hỗ trợ giáo viên Coding HCM1 với giao diện sáng, dữ liệu tối thiểu và trải nghiệm nhanh trên thiết bị lớp học.

## Lệnh bắt buộc

- Cài đặt: `npm install`
- Phát triển: `npm run dev`
- Kiểm tra: `npm run lint`
- Build: `npm run build`

## Quy ước

- Dùng TypeScript strict và Next.js App Router.
- Không đưa mật khẩu, token, email cá nhân, số điện thoại hoặc dữ liệu HR vào Git.
- Dữ liệu giáo viên chỉ gồm `name`, `code`, `center`.
- Không khôi phục các tab đã loại bỏ nếu chưa có yêu cầu rõ ràng.
- Mọi thay đổi giao diện phải kiểm tra desktop và mobile.
- Tuân thủ type scale và table system trong `docs/UI_SYSTEM.md`; không dùng font nhỏ hơn 12px.
- Nội dung mặc định đặt trong `lib/contentSettings.ts`.

## Phạm vi điều hướng

Các mục chính: Giáo trình, Tìm phiếu, Nhận xét Zalo, Link Mentor và Lộ trình ứng viên.

## Skill dự án

Đọc `.agents/skills/coding-hcm1-app/SKILL.md` trước các thay đổi liên quan tới dữ liệu giáo viên, nội dung admin hoặc điều hướng.
