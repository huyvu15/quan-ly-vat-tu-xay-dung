# Quick Deploy Guide - Vercel

## Bước 1: Cài đặt Vercel CLI

```bash
npm install -g vercel
```

## Bước 2: Deploy Backend

```bash
cd server
vercel
```

**Khi được hỏi:**
- Set up and deploy? → **Y**
- Which scope? → Chọn account của bạn
- Link to existing project? → **N**
- Project name? → `construction-materials-api`
- Directory? → `./server`
- Override settings? → **N**

**Sau khi deploy xong, ghi nhớ URL backend** (ví dụ: `https://construction-materials-api.vercel.app`)

## Bước 3: Cấu hình Environment Variables cho Backend

1. Vào https://vercel.com/dashboard
2. Chọn project `construction-materials-api`
3. Vào **Settings** → **Environment Variables**
4. Thêm các biến sau:

```
PG_HOST=ep-muddy-fog-a1bqzezj-pooler.ap-southeast-1.aws.neon.tech
PG_PORT=5432
PG_DATABASE=neondb
PG_USER=neondb_owner
PG_PASSWORD=npg_deLGS3plzXH8
NODE_ENV=production
JWT_SECRET=your-strong-secret-key-here-change-this
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
```

5. Click **Save** và **Redeploy** project

## Bước 4: Deploy Frontend

```bash
cd client
vercel
```

**Khi được hỏi:**
- Set up and deploy? → **Y**
- Which scope? → Chọn account của bạn
- Link to existing project? → **N**
- Project name? → `construction-materials-web`
- Directory? → `./client`
- Override settings? → **N**

## Bước 5: Cấu hình Environment Variables cho Frontend

1. Vào https://vercel.com/dashboard
2. Chọn project `construction-materials-web`
3. Vào **Settings** → **Environment Variables**
4. Thêm biến:

```
REACT_APP_API_URL=https://construction-materials-api.vercel.app/api
```

**Lưu ý:** Thay `construction-materials-api` bằng tên project backend thực tế của bạn.

5. Click **Save** và **Redeploy** project

## Bước 6: Chạy Migration và Seed Data

Sau khi backend đã deploy, bạn cần chạy migration:

**Cách 1: Chạy local với production database**

Cập nhật file `.env` ở root với production database credentials và chạy:

```bash
cd server
npm run migrate
npm run seed
```

**Cách 2: Tạo API endpoint để chạy migration** (Khuyến nghị cho production)

Tạo file `server/routes/admin.js`:

```javascript
const express = require('express');
const router = express.Router();
const migrate = require('../migrations/migrate');
const seed = require('../migrations/seed');

router.post('/migrate', async (req, res) => {
  if (req.body.secret !== process.env.MIGRATE_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  try {
    await migrate();
    res.json({ message: 'Migration completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/seed', async (req, res) => {
  if (req.body.secret !== process.env.MIGRATE_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  try {
    await seed();
    res.json({ message: 'Seed completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

Thêm vào `server/index.js`:
```javascript
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);
```

Thêm `MIGRATE_SECRET` vào environment variables và gọi API:
```bash
curl -X POST https://your-backend.vercel.app/api/admin/migrate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-migrate-secret"}'
```

## Kiểm Tra

1. **Test Backend**: https://your-backend.vercel.app/api/health
2. **Test Frontend**: https://your-frontend.vercel.app
3. **Đăng nhập**: admin / admin

## Deploy Lại Sau Khi Sửa Code

```bash
# Backend
cd server
vercel --prod

# Frontend
cd client
vercel --prod
```

## Troubleshooting

- **Lỗi database connection**: Kiểm tra environment variables đã được set đúng chưa
- **Frontend không kết nối được API**: Kiểm tra `REACT_APP_API_URL` đã đúng chưa
- **404 errors**: Đảm bảo đã redeploy sau khi thêm environment variables

