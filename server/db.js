const path = require('path');
// Load .env từ thư mục gốc của project
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Pool } = require('pg');

// Kiểm tra xem có phải là cloud database không (Neon, Railway, Supabase, etc.)
const isCloudDatabase = !!(process.env.PG_HOST || process.env.DB_HOST);
const isLocalhost = (process.env.PG_HOST || process.env.DB_HOST || '').includes('localhost');

// Hỗ trợ cả PG_ và DB_ prefix (Neon PostgreSQL thường dùng PG_)
const pool = new Pool({
  host: process.env.PG_HOST || process.env.DB_HOST || 'localhost',
  port: process.env.PG_PORT || process.env.DB_PORT || 5432,
  database: process.env.PG_DATABASE || process.env.DB_NAME || 'construction_materials',
  user: process.env.PG_USER || process.env.DB_USER || 'postgres',
  password: process.env.PG_PASSWORD || process.env.DB_PASSWORD || 'postgres',
  // Cloud databases (như Neon) yêu cầu SSL, localhost thì không
  ssl: isCloudDatabase && !isLocalhost 
    ? { rejectUnauthorized: false } 
    : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection và log thông tin
pool.on('connect', () => {
  console.log('Database connected successfully');
});

// Log database configuration (không log password)
console.log('Database Configuration:', {
  host: process.env.PG_HOST || process.env.DB_HOST || 'localhost',
  port: process.env.PG_PORT || process.env.DB_PORT || 5432,
  database: process.env.PG_DATABASE || process.env.DB_NAME || 'construction_materials',
  user: process.env.PG_USER || process.env.DB_USER || 'postgres',
  ssl: isCloudDatabase && !isLocalhost ? 'enabled' : 'disabled',
  isCloudDatabase,
  isLocalhost
});

module.exports = pool;

