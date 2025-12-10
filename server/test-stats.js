const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('./db');

const testStats = async () => {
  try {
    console.log('Testing stats queries...\n');
    
    // Test receipts by month
    const receipts = await pool.query(`
      SELECT 
        TO_CHAR(receipt_date, 'YYYY-MM') as month,
        COUNT(*)::INTEGER as count,
        COALESCE(SUM(total_amount), 0)::DECIMAL as total_amount
      FROM receipts
      GROUP BY TO_CHAR(receipt_date, 'YYYY-MM')
      ORDER BY month
    `);
    console.log('Receipts by month:', receipts.rows.length, 'rows');
    console.log(JSON.stringify(receipts.rows, null, 2));
    
    // Test issues by month
    const issues = await pool.query(`
      SELECT 
        TO_CHAR(issue_date, 'YYYY-MM') as month,
        COUNT(*)::INTEGER as count
      FROM issues
      GROUP BY TO_CHAR(issue_date, 'YYYY-MM')
      ORDER BY month
    `);
    console.log('\nIssues by month:', issues.rows.length, 'rows');
    console.log(JSON.stringify(issues.rows, null, 2));
    
    // Test materials by category
    const materials = await pool.query(`
      SELECT 
        category,
        COUNT(*)::INTEGER as count
      FROM materials
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY count DESC
    `);
    console.log('\nMaterials by category:', materials.rows.length, 'rows');
    console.log(JSON.stringify(materials.rows, null, 2));
    
    // Test projects by status
    const projects = await pool.query(`
      SELECT 
        COALESCE(status, 'active') as status,
        COUNT(*)::INTEGER as count
      FROM projects
      GROUP BY status
    `);
    console.log('\nProjects by status:', projects.rows.length, 'rows');
    console.log(JSON.stringify(projects.rows, null, 2));
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    await pool.end();
  }
};

testStats();

