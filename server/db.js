const path = require('path');
// Load .env từ thư mục gốc của project (chỉ trong development)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const { Pool } = require('pg');

// Hỗ trợ cả PG_ và DB_ prefix (Neon PostgreSQL thường dùng PG_)
const pool = new Pool({
  host: process.env.PG_HOST || process.env.DB_HOST || 'localhost',
  port: process.env.PG_PORT || process.env.DB_PORT || 5432,
  database: process.env.PG_DATABASE || process.env.DB_NAME || 'construction_materials',
  user: process.env.PG_USER || process.env.DB_USER || 'postgres',
  password: process.env.PG_PASSWORD || process.env.DB_PASSWORD || 'postgres',
  // Neon PostgreSQL yêu cầu SSL trong production
  ssl: (process.env.PG_HOST || process.env.DB_HOST) && process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;

