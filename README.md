# Những Trang Thương Mến — Hardcover Scrapbook

Starter website React + Vite + TypeScript + Supabase.

## 1. Chạy thử giao diện

Yêu cầu Node.js 20+.

```bash
npm install
npm run dev
```

Mở URL Vite hiển thị trong terminal. Nếu chưa cấu hình Supabase, bìa sách và giao diện vẫn chạy ở chế độ trống.

## 2. Kết nối Supabase

1. Tạo dự án tại https://supabase.com/dashboard.
2. Mở SQL Editor và chạy toàn bộ `supabase/schema.sql`.
3. Trong Storage, tạo bucket `greeting-cards`, tắt Public bucket, giới hạn 10 MB, chỉ cho phép `image/jpeg`, `image/png`, `image/webp`.
4. Tạo tài khoản quản trị trong Authentication > Users. Tắt public signups nếu không cần đăng ký công khai.
5. Sao chép UUID của tài khoản quản trị và chạy:
   ```sql
   insert into public.app_admins (user_id)
   values ('UUID-TAI-KHOAN-CUA-BAN');
   ```
6. Vào Project Settings > API, lấy Project URL và Publishable key (hoặc anon key).
7. Tạo file `.env` ở thư mục gốc, dựa trên `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
   ```
8. Khởi động lại `npm run dev`.

**Không đưa service_role/secret key vào frontend, file .env phía client, GitHub hoặc ảnh chụp màn hình.**

## 3. Quyền truy cập

- Khách: không cần đăng nhập; chỉ đọc chương đã xuất bản.
- Quản trị viên: đăng nhập bằng email/mật khẩu Supabase Auth.
- RLS kiểm soát dữ liệu tại database.
- Bucket thiệp ở chế độ private; website tạo signed URL thời hạn 30 phút cho ảnh thuộc chương đã xuất bản.

## 4. Thêm nội dung

1. Mở website, chọn “Quản trị viên”.
2. Đăng nhập bằng tài khoản đã được thêm vào `app_admins`.
3. Thêm chương giáo viên; chương ban đầu ở trạng thái bản nháp.
4. Chọn chương để thêm kỷ niệm, lời tri ân, câu nói và thiệp.
5. Chọn “Xuất bản” khi đã kiểm tra nội dung.

## 5. Triển khai lên Vercel

1. Đưa thư mục dự án lên GitHub (không đưa `.env`).
2. Import repository vào https://vercel.com.
3. Thêm `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` trong Environment Variables.
4. Deploy.

## 6. Lưu ý về phiên bản starter

Starter hiện có:
- Bìa hardcover và giao diện lật trang kiểu 3D bằng chuyển cảnh.
- Lời ngỏ, mục lục, trang chương, trang kết.
- Chủ đề màu sắc theo môn học.
- Đăng nhập quản trị, thêm giáo viên, xuất bản/ẩn/xóa chương.
- Thêm kỷ niệm, tri ân, câu nói và tải thiệp.
- Đọc dữ liệu Supabase và nhận cập nhật realtime.

Các phần nên phát triển tiếp trước khi dùng chính thức:
- Trình chỉnh sửa hồ sơ giáo viên và ảnh chân dung.
- Xóa thiệp kèm xóa file Storage tương ứng.
- Sắp xếp thứ tự trang kéo-thả.
- Tối ưu page-turn cho màn hình nhỏ và accessibility.
- Kiểm thử bảo mật RLS với tài khoản khách và tài khoản không phải admin.
- Kiểm thử giới hạn dung lượng, loại ảnh và sao lưu dữ liệu.
