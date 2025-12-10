import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './CommonPages.css';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchInventory();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      const url = selectedProject ? `/inventory?project_id=${selectedProject}` : '/inventory';
      const response = await api.get(url);
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quản Lý Tồn Kho</h1>
        <div className="filter-group">
          <label>Lọc theo công trình:</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã Vật Tư</th>
              <th>Tên Vật Tư</th>
              <th>Đơn Vị</th>
              <th>Loại</th>
              <th>Công Trình</th>
              <th>Số Lượng</th>
              <th>Vị Trí</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">Chưa có dữ liệu</td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id}>
                  <td>{item.code}</td>
                  <td>{item.material_name}</td>
                  <td>{item.unit}</td>
                  <td>{item.category || '-'}</td>
                  <td>{item.project_name || 'Kho chung'}</td>
                  <td>
                    <span className={item.quantity <= 0 ? 'low-stock' : ''}>
                      {item.quantity}
                    </span>
                  </td>
                  <td>{item.location || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;

