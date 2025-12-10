# Hướng Dẫn Deploy Lên Vercel

## Phương Pháp Khuyến Nghị: Deploy Riêng Biệt

### Bước 1: Deploy Backend (Server) Trước

1. **Cài đặt Vercel CLI** (nếu chưa có):
```bash
npm install -g vercel
```

2. **Đăng nhập Vercel**:
```bash
vercel login
```

3. **Tạo project backend**:
```bash
cd server
vercel
```
- Chọn: **Create a new project**
- Project name: `construction-materials-api` (hoặc tên bạn muốn)
- Directory: `./server`
- Override settings: **No**

4. **Cấu hình Environment Variables**:
   - Vào https://vercel.com/dashboard
   - Chọn project vừa tạo
   - Vào **Settings** → **Environment Variables**
   - Thêm các biến sau:

```
PG_HOST=ep-muddy-fog-a1bqzezj-pooler.ap-southeast-1.aws.neon.tech
PG_PORT=5432
PG_DATABASE=neondb
PG_USER=neondb_owner
PG_PASSWORD=npg_deLGS3plzXH8
NODE_ENV=production
JWT_SECRET=your-strong-secret-key-change-this
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
```

5. **Ghi nhớ Backend URL**:
   - Sau khi deploy xong, Vercel sẽ cho URL như: `https://construction-materials-api.vercel.app`
   - URL này sẽ là: `https://your-project-name.vercel.app`

### Bước 2: Deploy Frontend (Client)

1. **Cập nhật API URL trong client**:
   - Tạo file `client/.env.production`:
     ```
     REACT_APP_API_URL=https://your-backend-url.vercel.app/api
     ```
   - Thay `your-backend-url` bằng URL thực tế từ bước 1

2. **Deploy client**:
```bash
cd client
vercel
```
- Chọn: **Create a new project**
- Project name: `construction-materials-web`
- Directory: `./client`
- Override settings: **No**

3. **Cấu hình Environment Variables cho Client**:
   - Trong Vercel Dashboard → Project Settings → Environment Variables
   - Thêm:
     ```
     REACT_APP_API_URL=https://your-backend-url.vercel.app/api
     ```

### Bước 3: Chạy Migration và Seed Data

Sau khi deploy backend, bạn cần chạy migration:

**Cách 1: Tạo API endpoint để chạy migration** (Khuyến nghị)

Tạo file `server/routes/admin.js`:
```javascript
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Chỉ cho phép chạy với secret key
router.post('/migrate', async (req, res) => {
  if (req.body.secret !== process.env.MIGRATE_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  try {
    // Import và chạy migration
    const migrate = require('../migrations/migrate');
    res.json({ message: 'Migration started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Cách 2: Chạy migration local và kết nối đến production DB**

Cập nhật `.env` với production database credentials và chạy:
```bash
cd server
npm run migrate
npm run seed
```

## Cấu Hình Chi Tiết

### Backend Environment Variables

Trong Vercel Dashboard → Project → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `PG_HOST` | ep-muddy-fog-a1bqzezj-pooler.ap-southeast-1.aws.neon.tech |
| `PG_PORT` | 5432 |
| `PG_DATABASE` | neondb |
| `PG_USER` | neondb_owner |
| `PG_PASSWORD` | npg_deLGS3plzXH8 |
| `NODE_ENV` | production |
| `JWT_SECRET` | (tạo secret key mạnh) |
| `ADMIN_USERNAME` | admin |
| `ADMIN_PASSWORD` | admin |

### Frontend Environment Variables

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | https://your-backend-url.vercel.app/api |

## Kiểm Tra Sau Khi Deploy

1. **Test Backend Health**:
   ```
   https://your-backend.vercel.app/api/health
   ```
   Phải trả về: `{"status":"OK","message":"Server is running"}`

2. **Test Frontend**:
   ```
   https://your-frontend.vercel.app
   ```
   - Đăng nhập với: admin / admin
   - Kiểm tra các trang hoạt động

3. **Test API từ Frontend**:
   - Mở Browser Console
   - Kiểm tra các API requests có được gửi đúng không

## Lưu Ý Quan Trọng

1. **Database**: Neon PostgreSQL đã được cấu hình, không cần thay đổi
2. **CORS**: Backend đã có `cors()` middleware, sẽ hoạt động với mọi origin
3. **Environment Variables**: PHẢI cấu hình trong Vercel Dashboard, không dùng file `.env`
4. **Build Time**: 
   - Backend: Vercel tự động detect Node.js
   - Frontend: Vercel tự động detect React và chạy `npm run build`
5. **API Routes**: Sử dụng serverless functions của Vercel

## Troubleshooting

### Lỗi: "Cannot find module"
- Kiểm tra `package.json` có đầy đủ dependencies
- Đảm bảo `node_modules` được commit hoặc Vercel tự động install

### Lỗi: "Database connection failed"
- Kiểm tra environment variables đã được set trong Vercel
- Đảm bảo Neon PostgreSQL cho phép connections từ Vercel IPs
- Kiểm tra SSL connection (Neon yêu cầu SSL)

### Lỗi: CORS
- Backend đã có `cors()` middleware
- Nếu vẫn lỗi, cập nhật CORS config trong `api/index.js`

### Frontend không kết nối được API
- Kiểm tra `REACT_APP_API_URL` đã được set đúng
- Kiểm tra backend URL có đúng không
- Xem Browser Console để debug

## Cấu Trúc Files Đã Tạo

- `vercel.json` - Cấu hình Vercel (nếu deploy monorepo)
- `api/index.js` - Serverless function wrapper cho backend
- `client/vercel.json` - Cấu hình riêng cho client
- `.vercelignore` - Files không cần deploy

## Deploy Lại Sau Khi Sửa Code

```bash
# Backend
cd server
vercel --prod

# Frontend  
cd client
vercel --prod
```

Hoặc push code lên Git và Vercel sẽ tự động deploy nếu đã kết nối với Git repository.
