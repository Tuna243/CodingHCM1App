# Coding HCM1 App

Cổng tài liệu và công cụ hỗ trợ giáo viên Coding tại các cơ sở Phan Văn Trị, Tô Ký, Quang Trung và Phan Xích Long.

## Chức năng

- Giáo trình Coding K12 từ Microsoft SharePoint.
- Tìm phiếu và các công cụ vận hành được giữ lại từ ứng dụng nguồn.
- Tài liệu nhận xét Zalo có thể cấu hình tại `/admin`.
- Danh sách giáo viên lấy động từ Google Sheets, chỉ trả về họ tên, mã giáo viên và cơ sở.
- Giao diện sáng, responsive cho desktop và mobile.

## Chạy local

```bash
npm install
copy .env.example .env.local
npm run dev
```

Thiết lập `ADMIN_PASSWORD` trong `.env.local`. Không commit file `.env.local`.

## Kiểm tra

```bash
npm run lint
npm run build
```

## Deploy

Xem [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Người thực hiện

Nguyễn Hoàng Tuấn
