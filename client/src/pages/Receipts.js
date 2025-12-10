import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './CommonPages.css';

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [formData, setFormData] = useState({
    receipt_number: '',
    project_id: '',
    supplier_id: '',
    receipt_date: new Date().toISOString().split('T')[0],
    notes: '',
    items: [{ material_id: '', quantity: 0, unit_price: 0, notes: '' }],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [receiptsRes, materialsRes, projectsRes, suppliersRes] = await Promise.all([
        api.get('/receipts'),
        api.get('/materials'),
        api.get('/projects'),
        api.get('/suppliers'),
      ]);
      setReceipts(receiptsRes.data);
      setMaterials(materialsRes.data);
      setProjects(projectsRes.data);
      setSuppliers(suppliersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const items = formData.items
        .filter(item => item.material_id && item.quantity > 0)
        .map(item => ({
          ...item,
          total_price: item.quantity * parseFloat(item.unit_price || 0),
        }));

      if (items.length === 0) {
        alert('Vui lòng thêm ít nhất một vật tư');
        return;
      }

      await api.post('/receipts', {
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
      items: [...formData.items, { material_id: '', quantity: 0, unit_price: 0, notes: '' }],
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
      receipt_number: '',
      project_id: '',
      supplier_id: '',
      receipt_date: new Date().toISOString().split('T')[0],
      notes: '',
      items: [{ material_id: '', quantity: 0, unit_price: 0, notes: '' }],
    });
  };

  const viewReceipt = async (id) => {
    try {
      const response = await api.get(`/receipts/${id}`);
      setViewingReceipt(response.data);
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
        <h1>Quản Lý Phiếu Nhập</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Tạo Phiếu Nhập
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Số Phiếu</th>
              <th>Ngày Nhập</th>
              <th>Công Trình</th>
              <th>Nhà Cung Cấp</th>
              <th>Tổng Tiền</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {receipts.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">Chưa có dữ liệu</td>
              </tr>
            ) : (
              receipts.map((receipt) => (
                <tr key={receipt.id}>
                  <td>{receipt.receipt_number}</td>
                  <td>{receipt.receipt_date}</td>
                  <td>{receipt.project_name || '-'}</td>
                  <td>{receipt.supplier_name || '-'}</td>
                  <td>{new Intl.NumberFormat('vi-VN').format(receipt.total_amount || 0)} đ</td>
                  <td>
                    <button className="btn-view" onClick={() => viewReceipt(receipt.id)}>Xem</button>
                    <button className="btn-delete" onClick={() => {
                      if (window.confirm('Xóa phiếu nhập?')) {
                        api.delete(`/receipts/${receipt.id}`).then(fetchData);
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
            <h2>Tạo Phiếu Nhập</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Số Phiếu *</label>
                  <input
                    type="text"
                    value={formData.receipt_number}
                    onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ngày Nhập *</label>
                  <input
                    type="date"
                    value={formData.receipt_date}
                    onChange={(e) => setFormData({ ...formData, receipt_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Công Trình</label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  >
                    <option value="">Chọn công trình</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Nhà Cung Cấp</label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  >
                    <option value="">Chọn nhà cung cấp</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Ghi Chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                />
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
                      type="number"
                      placeholder="Đơn giá"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
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

      {/* Modal xem chi tiết phiếu nhập */}
      {viewingReceipt && (
        <div className="modal-overlay" onClick={() => setViewingReceipt(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>Chi Tiết Phiếu Nhập: {viewingReceipt.receipt_number}</h2>
            <div className="receipt-details">
              <div className="detail-row">
                <strong>Ngày Nhập:</strong> <span>{viewingReceipt.receipt_date}</span>
              </div>
              <div className="detail-row">
                <strong>Công Trình:</strong> <span>{viewingReceipt.project_name || '-'}</span>
              </div>
              <div className="detail-row">
                <strong>Nhà Cung Cấp:</strong> <span>{viewingReceipt.supplier_name || '-'}</span>
              </div>
              <div className="detail-row">
                <strong>Tổng Tiền:</strong> <span className="total-amount">{new Intl.NumberFormat('vi-VN').format(viewingReceipt.total_amount || 0)} đ</span>
              </div>
              {viewingReceipt.notes && (
                <div className="detail-row">
                  <strong>Ghi Chú:</strong> <span>{viewingReceipt.notes}</span>
                </div>
              )}
            </div>
            
            <div className="items-section">
              <h3>Chi Tiết Vật Tư</h3>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Mã Vật Tư</th>
                    <th>Tên Vật Tư</th>
                    <th>Số Lượng</th>
                    <th>Đơn Giá</th>
                    <th>Thành Tiền</th>
                    <th>Ghi Chú</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingReceipt.items && viewingReceipt.items.length > 0 ? (
                    viewingReceipt.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.code}</td>
                        <td>{item.material_name}</td>
                        <td>{item.quantity} {item.unit}</td>
                        <td>{new Intl.NumberFormat('vi-VN').format(item.unit_price || 0)} đ</td>
                        <td>{new Intl.NumberFormat('vi-VN').format(item.total_price || 0)} đ</td>
                        <td>{item.notes || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-state">Chưa có chi tiết</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setViewingReceipt(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipts;

