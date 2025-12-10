const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Thống kê phiếu nhập/xuất theo tháng
router.get('/receipts-by-month', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(receipt_date, 'YYYY-MM') as month,
        COUNT(*)::INTEGER as count,
        COALESCE(SUM(total_amount), 0)::DECIMAL as total_amount
      FROM receipts
      GROUP BY TO_CHAR(receipt_date, 'YYYY-MM')
      ORDER BY month
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

// Thống kê phiếu xuất theo tháng
router.get('/issues-by-month', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(issue_date, 'YYYY-MM') as month,
        COUNT(*)::INTEGER as count
      FROM issues
      GROUP BY TO_CHAR(issue_date, 'YYYY-MM')
      ORDER BY month
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

// Thống kê vật tư theo loại
router.get('/materials-by-category', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        category,
        COUNT(*)::INTEGER as count
      FROM materials
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

// Thống kê tồn kho theo công trình
router.get('/inventory-by-project', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(p.name, 'Kho chung') as project_name,
        COUNT(DISTINCT i.material_id)::INTEGER as material_count,
        COALESCE(SUM(i.quantity), 0)::INTEGER as total_quantity
      FROM inventory i
      LEFT JOIN projects p ON i.project_id = p.id
      GROUP BY p.name
      ORDER BY total_quantity DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

// Thống kê giá trị tồn kho theo công trình
router.get('/inventory-value-by-project', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(p.name, 'Kho chung') as project_name,
        COUNT(DISTINCT i.material_id) as material_count,
        SUM(i.quantity) as total_quantity
      FROM inventory i
      LEFT JOIN projects p ON i.project_id = p.id
      GROUP BY p.name
      ORDER BY total_quantity DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

// Thống kê top vật tư được sử dụng nhiều nhất
router.get('/top-materials', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.code,
        m.name,
        m.unit,
        COALESCE(SUM(ii.quantity), 0)::INTEGER as total_issued
      FROM materials m
      LEFT JOIN issue_items ii ON m.id = ii.material_id
      GROUP BY m.id, m.code, m.name, m.unit
      ORDER BY total_issued DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

// Thống kê công trình theo trạng thái
router.get('/projects-by-status', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(status, 'active') as status,
        COUNT(*)::INTEGER as count
      FROM projects
      GROUP BY status
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

module.exports = router;

