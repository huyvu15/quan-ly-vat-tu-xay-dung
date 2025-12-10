const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, p.name as project_name, s.name as supplier_name
      FROM receipts r
      LEFT JOIN projects p ON r.project_id = p.id
      LEFT JOIN suppliers s ON r.supplier_id = s.id
      ORDER BY r.receipt_date DESC, r.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const receiptResult = await pool.query(`
      SELECT r.*, p.name as project_name, s.name as supplier_name
      FROM receipts r
      LEFT JOIN projects p ON r.project_id = p.id
      LEFT JOIN suppliers s ON r.supplier_id = s.id
      WHERE r.id = $1
    `, [req.params.id]);
    
    if (receiptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    const itemsResult = await pool.query(`
      SELECT ri.*, m.code, m.name as material_name, m.unit
      FROM receipt_items ri
      JOIN materials m ON ri.material_id = m.id
      WHERE ri.receipt_id = $1
    `, [req.params.id]);
    
    res.json({
      ...receiptResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { receipt_number, project_id, supplier_id, receipt_date, notes, items, created_by } = req.body;
    
    // Tính tổng tiền
    const total_amount = items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
    
    // Tạo phiếu nhập
    const receiptResult = await client.query(
      `INSERT INTO receipts (receipt_number, project_id, supplier_id, receipt_date, total_amount, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [receipt_number, project_id, supplier_id, receipt_date, total_amount, notes, created_by || 'admin']
    );
    
    const receiptId = receiptResult.rows[0].id;
    
    // Tạo chi tiết phiếu nhập
    for (const item of items) {
      await client.query(
        `INSERT INTO receipt_items (receipt_id, material_id, quantity, unit_price, total_price, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [receiptId, item.material_id, item.quantity, item.unit_price, item.total_price, item.notes]
      );
      
      // Cập nhật tồn kho
      await client.query(
        `INSERT INTO inventory (material_id, project_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (material_id, project_id)
         DO UPDATE SET quantity = inventory.quantity + $3, last_updated = CURRENT_TIMESTAMP`,
        [item.material_id, project_id, item.quantity]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(receiptResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM receipts WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    res.json({ message: 'Receipt deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

