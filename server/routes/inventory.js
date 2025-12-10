const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { project_id } = req.query;
    let query = `
      SELECT i.*, m.code, m.name as material_name, m.unit, m.category,
             p.name as project_name
      FROM inventory i
      JOIN materials m ON i.material_id = m.id
      LEFT JOIN projects p ON i.project_id = p.id
    `;
    const params = [];
    
    if (project_id) {
      query += ' WHERE i.project_id = $1';
      params.push(project_id);
    }
    
    query += ' ORDER BY m.code';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/low-stock', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, m.code, m.name as material_name, m.unit, 
             COALESCE(m.min_stock, 0) as min_stock,
             p.name as project_name
      FROM inventory i
      JOIN materials m ON i.material_id = m.id
      LEFT JOIN projects p ON i.project_id = p.id
      WHERE i.quantity <= COALESCE(m.min_stock, 0)
      ORDER BY COALESCE(m.code, m.name)
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching low stock:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    res.status(500).json({ error: error.message, code: error.code });
  }
});

module.exports = router;

