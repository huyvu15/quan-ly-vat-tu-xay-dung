import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './CommonPages.css';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewingIssue, setViewingIssue] = useState(null);
  const [formData, setFormData] = useState({
    issue_number: '',
    project_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    purpose: '',
    approved_by: '',
    items: [{ material_id: '', quantity: 0, notes: '' }],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [issuesRes, materialsRes, projectsRes] = await Promise.all([
        api.get('/issues'),
        api.get('/materials'),
        api.get('/projects'),
      ]);
      setIssues(issuesRes.data);
      setMaterials(materialsRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const items = formData.items.filter(item => item.material_id && item.quantity > 0);

      if (items.length === 0) {
        alert('Vui lòng thêm ít nhất một vật tư');
        return;
      }

      await api.post('/issues', {
        ...formData,
        items,
      });
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { material_id: '', quantity: 0, notes: '' }],
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const resetForm = () => {
    setFormData({
      issue_number: '',
      project_id: '',
      issue_date: new Date().toISOString().split('T')[0],
      purpose: '',
      approved_by: '',
      items: [{ material_id: '', quantity: 0, notes: '' }],
    });
  };

  const viewIssue = async (id) => {
    try {
      const response = await api.get(`/issues/${id}`);
      setViewingIssue(response.data);
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quản Lý Phiếu Xuất</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Tạo Phiếu Xuất
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Số Phiếu</th>
              <th>Ngày Xuất</th>
              <th>Công Trình</th>
              <th>Mục Đích</th>
              <th>Người Duyệt</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">Chưa có dữ liệu</td>
              </tr>
            ) : (
              issues.map((issue) => (
                <tr key={issue.id}>
                  <td>{issue.issue_number}</td>
                  <td>{issue.issue_date}</td>
                  <td>{issue.project_name}</td>
                  <td>{issue.purpose || '-'}</td>
                  <td>{issue.approved_by || '-'}</td>
                  <td>
                    <button className="btn-view" onClick={() => viewIssue(issue.id)}>Xem</button>
                    <button className="btn-delete" onClick={() => {
                      if (window.confirm('Xóa phiếu xuất?')) {
                        api.delete(`/issues/${issue.id}`).then(fetchData);
                      }
                    }}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>Tạo Phiếu Xuất</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Số Phiếu *</label>
                  <input
                    type="text"
                    value={formData.issue_number}
                    onChange={(e) => setFormData({ ...formData, issue_number: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ngày Xuất *</label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Công Trình *</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  required
                >
                  <option value="">Chọn công trình</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mục Đích</label>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Người Duyệt</label>
                  <input
                    type="text"
                    value={formData.approved_by}
                    onChange={(e) => setFormData({ ...formData, approved_by: e.target.value })}
                  />
                </div>
              </div>
              <div className="items-section">
                <div className="items-header">
                  <h3>Chi Tiết Vật Tư</h3>
                  <button type="button" className="btn-secondary" onClick={addItem}>+ Thêm Vật Tư</button>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <select
                      value={item.material_id}
                      onChange={(e) => updateItem(index, 'material_id', e.target.value)}
                      required
                    >
                      <option value="">Chọn vật tư</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Số lượng"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Ghi chú"
                      value={item.notes}
                      onChange={(e) => updateItem(index, 'notes', e.target.value)}
                    />
                    {formData.items.length > 1 && (
                      <button type="button" className="btn-delete" onClick={() => removeItem(index)}>Xóa</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết phiếu xuất */}
      {viewingIssue && (
        <div className="modal-overlay" onClick={() => setViewingIssue(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>Chi Tiết Phiếu Xuất: {viewingIssue.issue_number}</h2>
            <div className="receipt-details">
              <div className="detail-row">
                <strong>Ngày Xuất:</strong> <span>{viewingIssue.issue_date}</span>
              </div>
              <div className="detail-row">
                <strong>Công Trình:</strong> <span>{viewingIssue.project_name}</span>
              </div>
              <div className="detail-row">
                <strong>Mục Đích:</strong> <span>{viewingIssue.purpose || '-'}</span>
              </div>
              <div className="detail-row">
                <strong>Người Duyệt:</strong> <span>{viewingIssue.approved_by || '-'}</span>
              </div>
              <div className="detail-row">
                <strong>Người Tạo:</strong> <span>{viewingIssue.created_by || '-'}</span>
              </div>
            </div>
            
            <div className="items-section">
              <h3>Chi Tiết Vật Tư</h3>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Mã Vật Tư</th>
                    <th>Tên Vật Tư</th>
                    <th>Đơn Vị</th>
                    <th>Số Lượng</th>
                    <th>Ghi Chú</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingIssue.items && viewingIssue.items.length > 0 ? (
                    viewingIssue.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.code}</td>
                        <td>{item.material_name}</td>
                        <td>{item.unit}</td>
                        <td>{item.quantity}</td>
                        <td>{item.notes || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-state">Chưa có chi tiết</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setViewingIssue(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Issues;

