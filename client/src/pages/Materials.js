import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './CommonPages.css';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    unit: '',
    category: '',
    description: '',
    min_stock: 0,
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/materials');
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await api.put(`/materials/${editingMaterial.id}`, formData);
      } else {
        await api.post('/materials', formData);
      }
      fetchMaterials();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      code: material.code || '',
      name: material.name || '',
      unit: material.unit || '',
      category: material.category || '',
      description: material.description || '',
      min_stock: material.min_stock || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa vật tư này?')) {
      try {
        await api.delete(`/materials/${id}`);
        fetchMaterials();
      } catch (error) {
        alert('Lỗi: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      unit: '',
      category: '',
      description: '',
      min_stock: 0,
    });
    setEditingMaterial(null);
  };

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quản Lý Vật Tư</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Thêm Vật Tư
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã Vật Tư</th>
              <th>Tên Vật Tư</th>
              <th>Đơn Vị</th>
              <th>Loại</th>
              <th>Tồn Tối Thiểu</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {materials.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">Chưa có dữ liệu</td>
              </tr>
            ) : (
              materials.map((material) => (
                <tr key={material.id}>
                  <td>{material.code}</td>
                  <td>{material.name}</td>
                  <td>{material.unit}</td>
                  <td>{material.category || '-'}</td>
                  <td>{material.min_stock}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(material)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDelete(material.id)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingMaterial ? 'Sửa Vật Tư' : 'Thêm Vật Tư'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Mã Vật Tư *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Đơn Vị *</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                    placeholder="VD: kg, m, m²"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Tên Vật Tư *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Loại</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="VD: Xi măng, Thép, Gạch"
                />
              </div>
              <div className="form-group">
                <label>Tồn Tối Thiểu</label>
                <input
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Mô Tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
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
    </div>
  );
};

export default Materials;

