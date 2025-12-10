// Vercel serverless function wrapper
const path = require('path');
// Load environment variables (Vercel sẽ tự động inject)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const express = require('express');
const cors = require('cors');
const authRoutes = require('../server/routes/auth');
const projectsRoutes = require('../server/routes/projects');
const materialsRoutes = require('../server/routes/materials');
const suppliersRoutes = require('../server/routes/suppliers');
const inventoryRoutes = require('../server/routes/inventory');
const receiptsRoutes = require('../server/routes/receipts');
const issuesRoutes = require('../server/routes/issues');
const statsRoutes = require('../server/routes/stats');

const app = express();

// CORS configuration - cho phép tất cả origins trong production
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message });
});

// Export for Vercel serverless function
module.exports = app;

