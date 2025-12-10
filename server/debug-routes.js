const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('./db');

const testQueries = async () => {
  console.log('Testing database queries...\n');
  
  const queries = [
    { name: 'Projects', sql: 'SELECT * FROM projects LIMIT 1' },
    { name: 'Materials', sql: 'SELECT * FROM materials LIMIT 1' },
    { name: 'Suppliers', sql: 'SELECT * FROM suppliers LIMIT 1' },
    { name: 'Inventory', sql: 'SELECT * FROM inventory LIMIT 1' },
    { name: 'Receipts', sql: 'SELECT * FROM receipts LIMIT 1' },
    { name: 'Issues', sql: 'SELECT * FROM issues LIMIT 1' },
  ];

  for (const query of queries) {
    try {
      const result = await pool.query(query.sql);
      console.log(`✅ ${query.name}: OK (${result.rows.length} rows)`);
    } catch (error) {
      console.error(`❌ ${query.name}:`, error.message);
      console.error('   SQL:', query.sql);
    }
  }

  // Test stats queries
  console.log('\nTesting stats queries...\n');
  
  const statsQueries = [
    { 
      name: 'Receipts by month', 
      sql: `SELECT TO_CHAR(receipt_date, 'YYYY-MM') as month, COUNT(*) as count, SUM(total_amount) as total_amount FROM receipts WHERE receipt_date >= CURRENT_DATE - INTERVAL '6 months' GROUP BY TO_CHAR(receipt_date, 'YYYY-MM') ORDER BY month`
    },
    {
      name: 'Materials by category',
      sql: `SELECT category, COUNT(*) as count FROM materials WHERE category IS NOT NULL GROUP BY category ORDER BY count DESC`
    },
    {
      name: 'Projects by status',
      sql: `SELECT status, COUNT(*) as count FROM projects GROUP BY status`
    },
  ];

  for (const query of statsQueries) {
    try {
      const result = await pool.query(query.sql);
      console.log(`✅ ${query.name}: OK (${result.rows.length} rows)`);
      if (result.rows.length > 0) {
        console.log('   Sample:', result.rows[0]);
      }
    } catch (error) {
      console.error(`❌ ${query.name}:`, error.message);
      console.error('   SQL:', query.sql.substring(0, 100) + '...');
    }
  }

  await pool.end();
  process.exit(0);
};

testQueries().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

