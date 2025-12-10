const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, p.name as project_name
      FROM issues i
      JOIN projects p ON i.project_id = p.id
      ORDER BY i.issue_date DESC, i.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching issues:', error);
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
    const issueResult = await pool.query(`
      SELECT i.*, p.name as project_name
      FROM issues i
      JOIN projects p ON i.project_id = p.id
      WHERE i.id = $1
    `, [req.params.id]);
    
    if (issueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    const itemsResult = await pool.query(`
      SELECT ii.*, m.code, m.name as material_name, m.unit
      FROM issue_items ii
      JOIN materials m ON ii.material_id = m.id
      WHERE ii.issue_id = $1
    `, [req.params.id]);
    
    res.json({
      ...issueResult.rows[0],
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
    
    const { issue_number, project_id, issue_date, purpose, approved_by, items, created_by } = req.body;
    
    // Tạo phiếu xuất
    const issueResult = await client.query(
      `INSERT INTO issues (issue_number, project_id, issue_date, purpose, approved_by, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [issue_number, project_id, issue_date, purpose, approved_by, created_by || 'admin']
    );
    
    const issueId = issueResult.rows[0].id;
    
    // Tạo chi tiết phiếu xuất và cập nhật tồn kho
    for (const item of items) {
      await client.query(
        `INSERT INTO issue_items (issue_id, material_id, quantity, notes)
         VALUES ($1, $2, $3, $4)`,
        [issueId, item.material_id, item.quantity, item.notes]
      );
      
      // Trừ tồn kho
      const inventoryResult = await client.query(
        `SELECT quantity FROM inventory WHERE material_id = $1 AND project_id = $2`,
        [item.material_id, project_id]
      );
      
      if (inventoryResult.rows.length === 0 || inventoryResult.rows[0].quantity < item.quantity) {
        throw new Error(`Insufficient inventory for material ID ${item.material_id}`);
      }
      
      await client.query(
        `UPDATE inventory SET quantity = quantity - $1, last_updated = CURRENT_TIMESTAMP
         WHERE material_id = $2 AND project_id = $3`,
        [item.quantity, item.material_id, project_id]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(issueResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM issues WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

