const path = require('path');
// Load .env từ thư mục gốc của project
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const pool = require('../db');

const checkDatabase = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Kết nối database thành công!');
    console.log('Thời gian server:', result.rows[0].now);
    
    // Kiểm tra số lượng bảng
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`\n📊 Số lượng bảng: ${tablesResult.rows.length}`);
    console.log('Các bảng trong database:');
    tablesResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name}`);
    });
    
    // Kiểm tra số lượng dữ liệu trong mỗi bảng
    console.log('\n📈 Số lượng dữ liệu trong các bảng:');
    const tables = ['projects', 'suppliers', 'materials', 'inventory', 'receipts', 'issues'];
    
    for (const table of tables) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  - ${table}: ${countResult.rows[0].count} bản ghi`);
      } catch (error) {
        console.log(`  - ${table}: Bảng chưa tồn tại`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error.message);
    console.error('\nChi tiết lỗi:', error);
    console.error('\n💡 Hãy đảm bảo:');
    console.error('   1. PostgreSQL đang chạy (hoặc Neon PostgreSQL đang hoạt động)');
    console.error('   2. File .env đã được cấu hình đúng');
    console.error('   3. Kiểm tra các biến môi trường:');
    console.error(`      - PG_HOST hoặc DB_HOST: ${process.env.PG_HOST || process.env.DB_HOST || 'CHƯA ĐẶT'}`);
    console.error(`      - PG_DATABASE hoặc DB_NAME: ${process.env.PG_DATABASE || process.env.DB_NAME || 'CHƯA ĐẶT'}`);
    console.error(`      - PG_USER hoặc DB_USER: ${process.env.PG_USER || process.env.DB_USER || 'CHƯA ĐẶT'}`);
    console.error(`      - PG_PASSWORD hoặc DB_PASSWORD: ${process.env.PG_PASSWORD || process.env.DB_PASSWORD ? 'ĐÃ ĐẶT' : 'CHƯA ĐẶT'}`);
    process.exit(1);
  }
};

checkDatabase();

