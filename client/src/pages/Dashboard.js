import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    materials: 0,
    suppliers: 0,
    lowStock: 0,
    receipts: 0,
    issues: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [receiptsByMonth, setReceiptsByMonth] = useState([]);
  const [issuesByMonth, setIssuesByMonth] = useState([]);
  const [materialsByCategory, setMaterialsByCategory] = useState([]);
  const [inventoryByProject, setInventoryByProject] = useState([]);
  const [projectsByStatus, setProjectsByStatus] = useState([]);
  const [topMaterials, setTopMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea'];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('Fetching stats from:', api.defaults.baseURL);
      
      const [
        projectsRes,
        materialsRes,
        suppliersRes,
        lowStockRes,
        receiptsRes,
        issuesRes,
        receiptsByMonthRes,
        issuesByMonthRes,
        materialsByCategoryRes,
        inventoryByProjectRes,
        projectsByStatusRes,
        topMaterialsRes
      ] = await Promise.all([
        api.get('/projects'),
        api.get('/materials'),
        api.get('/suppliers'),
        api.get('/inventory/low-stock'),
        api.get('/receipts'),
        api.get('/issues'),
        api.get('/stats/receipts-by-month'),
        api.get('/stats/issues-by-month'),
        api.get('/stats/materials-by-category'),
        api.get('/stats/inventory-by-project'),
        api.get('/stats/projects-by-status'),
        api.get('/stats/top-materials'),
      ]);

      console.log('Data received:', {
        projects: projectsRes.data.length,
        materials: materialsRes.data.length,
        suppliers: suppliersRes.data.length,
        receipts: receiptsRes.data.length,
        issues: issuesRes.data.length,
      });

      setStats({
        projects: projectsRes.data.length,
        materials: materialsRes.data.length,
        suppliers: suppliersRes.data.length,
        lowStock: lowStockRes.data.length,
        receipts: receiptsRes.data.length,
        issues: issuesRes.data.length,
      });
      setLowStockItems(lowStockRes.data.slice(0, 10));
      
      // Convert và format data cho charts
      setReceiptsByMonth((receiptsByMonthRes.data || []).map(item => ({
        month: item.month,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0),
        total_amount: typeof item.total_amount === 'string' ? parseFloat(item.total_amount) : (item.total_amount || 0)
      })));
      
      setIssuesByMonth((issuesByMonthRes.data || []).map(item => ({
        month: item.month,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0)
      })));
      
      setMaterialsByCategory((materialsByCategoryRes.data || []).map(item => ({
        category: item.category,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0),
        name: item.category
      })));
      
      setInventoryByProject((inventoryByProjectRes.data || []).map(item => ({
        ...item,
        material_count: typeof item.material_count === 'string' ? parseInt(item.material_count) : (item.material_count || 0),
        total_quantity: typeof item.total_quantity === 'string' ? parseInt(item.total_quantity) : (item.total_quantity || 0)
      })));
      
      setProjectsByStatus((projectsByStatusRes.data || []).map(item => ({
        status: item.status,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0)
      })));
      
      setTopMaterials((topMaterialsRes.data || []).map(item => ({
        ...item,
        total_issued: typeof item.total_issued === 'string' ? parseInt(item.total_issued) : (item.total_issued || 0),
        name: item.name || item.code
      })));
      
      console.log('Chart data loaded:', {
        receiptsByMonth: receiptsByMonthRes.data?.length || 0,
        issuesByMonth: issuesByMonthRes.data?.length || 0,
        materialsByCategory: materialsByCategoryRes.data?.length || 0,
        projectsByStatus: projectsByStatusRes.data?.length || 0,
        inventoryByProject: inventoryByProjectRes.data?.length || 0,
        topMaterials: topMaterialsRes.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      // Set empty arrays để tránh crash
      setReceiptsByMonth([]);
      setIssuesByMonth([]);
      setMaterialsByCategory([]);
      setInventoryByProject([]);
      setProjectsByStatus([]);
      setTopMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  // Format số tiền
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value || 0);
  };

  // Format tháng
  const formatMonth = (month) => {
    if (!month) return '';
    const [year, mon] = month.split('-');
    return `${mon}/${year}`;
  };

  if (loading) {
    return <div className="dashboard-loading">Đang tải...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Tổng quan hệ thống quản lý vật tư</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏗️</div>
          <div className="stat-info">
            <h3>{stats.projects}</h3>
            <p>Công Trình</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{stats.materials}</h3>
            <p>Vật Tư</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <h3>{stats.suppliers}</h3>
            <p>Nhà Cung Cấp</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>{stats.lowStock}</h3>
            <p>Vật Tư Sắp Hết</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📥</div>
          <div className="stat-info">
            <h3>{stats.receipts}</h3>
            <p>Phiếu Nhập</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📤</div>
          <div className="stat-info">
            <h3>{stats.issues}</h3>
            <p>Phiếu Xuất</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Chart 1: Phiếu nhập/xuất theo tháng */}
        <div className="chart-card">
          <h3>Phiếu Nhập & Xuất Theo Tháng</h3>
          {receiptsByMonth.length > 0 || issuesByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={(() => {
                // Merge receipts và issues by month
                const allMonths = new Set([
                  ...receiptsByMonth.map(r => r.month),
                  ...issuesByMonth.map(i => i.month)
                ]);
                const monthMap = new Map();
                
                receiptsByMonth.forEach(r => {
                  monthMap.set(r.month, { month: r.month, receipts: r.count, issues: 0 });
                });
                
                issuesByMonth.forEach(i => {
                  if (monthMap.has(i.month)) {
                    monthMap.get(i.month).issues = i.count;
                  } else {
                    monthMap.set(i.month, { month: i.month, receipts: 0, issues: i.count });
                  }
                });
                
                return Array.from(monthMap.values())
                  .sort((a, b) => a.month.localeCompare(b.month))
                  .map(item => ({
                    month: formatMonth(item.month),
                    'Phiếu Nhập': item.receipts,
                    'Phiếu Xuất': item.issues,
                  }));
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Phiếu Nhập" stroke="#667eea" strokeWidth={2} />
                <Line type="monotone" dataKey="Phiếu Xuất" stroke="#764ba2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 2: Giá trị phiếu nhập theo tháng */}
        <div className="chart-card">
          <h3>Giá Trị Phiếu Nhập Theo Tháng</h3>
          {receiptsByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={receiptsByMonth.map(item => ({
                month: formatMonth(item.month),
                'Giá trị (triệu VNĐ)': item.total_amount / 1000000 || 0,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${formatCurrency(value * 1000000)} đ`} />
                <Bar dataKey="Giá trị (triệu VNĐ)" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 3: Vật tư theo loại */}
        <div className="chart-card">
          <h3>Phân Bố Vật Tư Theo Loại</h3>
          {materialsByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={materialsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {materialsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 4: Công trình theo trạng thái */}
        <div className="chart-card">
          <h3>Công Trình Theo Trạng Thái</h3>
          {projectsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectsByStatus.map(item => ({
                    ...item,
                    name: item.status === 'active' ? 'Đang thi công' : item.status === 'completed' ? 'Hoàn thành' : item.status
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {projectsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 5: Tồn kho theo công trình */}
        <div className="chart-card">
          <h3>Tồn Kho Theo Công Trình</h3>
          {inventoryByProject.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryByProject}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="project_name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="material_count" fill="#43e97b" name="Số loại vật tư" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 6: Top vật tư được sử dụng */}
        <div className="chart-card">
          <h3>Top 10 Vật Tư Được Sử Dụng Nhiều Nhất</h3>
          {topMaterials.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMaterials.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="total_issued" fill="#fa709a" name="Số lượng đã xuất" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>
      </div>

      {/* Low Stock Items */}
      {lowStockItems.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>⚠️ Vật Tư Sắp Hết</h2>
            <Link to="/inventory" className="view-all-link">Xem tất cả →</Link>
          </div>
          <div className="low-stock-table">
            <table>
              <thead>
                <tr>
                  <th>Mã Vật Tư</th>
                  <th>Tên Vật Tư</th>
                  <th>Đơn Vị</th>
                  <th>Công Trình</th>
                  <th>Tồn Kho</th>
                  <th>Tồn Tối Thiểu</th>
                  <th>Vị Trí</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.code}</td>
                    <td>{item.material_name}</td>
                    <td>{item.unit}</td>
                    <td>{item.project_name || 'Kho chung'}</td>
                    <td className="low-stock-quantity">{item.quantity}</td>
                    <td>{item.min_stock}</td>
                    <td>{item.location || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
