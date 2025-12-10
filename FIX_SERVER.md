# Hướng Dẫn Sửa Lỗi Server

## Vấn Đề
- Routes trả về 500 (Internal Server Error)
- Routes stats trả về 404 (Not Found)

## Giải Pháp

### 1. Khởi Động Lại Server (QUAN TRỌNG)

**Dừng server hiện tại** (Ctrl+C trong terminal đang chạy server)

Sau đó chạy lại:
```bash
cd server
npm run dev
```

### 2. Kiểm Tra Server Logs

Khi có request, server sẽ log:
- `Error fetching projects: ...` - nếu có lỗi
- Chi tiết lỗi database

### 3. Đã Sửa

✅ Đơn giản hóa các queries (bỏ COALESCE với created_at)
✅ Thêm error logging chi tiết
✅ Fallback queries nếu có lỗi

### 4. Test Thủ Công

Mở browser và test:
- http://localhost:5000/api/health - Phải trả về `{"status":"OK"}`
- http://localhost:5000/api/auth/login - Test login

### 5. Nếu Vẫn Lỗi

Kiểm tra server console và gửi error message cụ thể để tiếp tục sửa.

## Lưu Ý

- **PHẢI khởi động lại server** sau mỗi lần sửa code
- Kiểm tra server console để xem lỗi cụ thể
- Database queries đã được test và hoạt động OK

