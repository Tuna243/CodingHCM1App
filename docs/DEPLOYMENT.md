# Deploy lên Vercel

1. Import repository `Tuna243/CodingHCM1App`.
2. Framework preset: Next.js.
3. Thêm Environment Variable:
   - `ADMIN_PASSWORD`: mật khẩu admin đã thống nhất với chủ dự án.
   - `NEXT_PUBLIC_APPSCRIPT_URL`: chỉ thêm khi có Apps Script thống kê.
   - `FIREBASE_API_KEY`: Firebase Web API key dùng để đăng nhập LMS MindX.
   - `LMS_SESSION_SECRET`: chuỗi ngẫu nhiên tối thiểu 32 ký tự để ký cookie LMS.
4. Deploy production.
5. Kiểm tra `/`, `/api/teachers`, `/api/lms/me` và `/admin`.

Không commit `.env.local` hoặc token Vercel/GitHub.
