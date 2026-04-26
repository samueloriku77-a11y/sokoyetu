import React, { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function ProductEditForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState(product || {
    name: '',
    description: '',
    price: '',
    category: 'LOCAL_MARKET',
    stock_qty: 0,
    is_available: true
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!product?.id) {
      toast.error('Please save the product details first before uploading images.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('side_name', 'main');

    try {
      const { data } = await api.post(`/vendor/products/${product.id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(f => ({ ...f, image_url: data.image_url }));
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock_qty: parseInt(form.stock_qty)
      };
      
      let res;
      if (product?.id) {
        res = await api.put(`/vendor/products/${product.id}`, payload);
        toast.success('Product updated!');
      } else {
        res = await api.post('/vendor/products', payload);
        toast.success('Product created!');
      }
      onSave(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="product-edit-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="form-group">
        <label>Product Name</label>
        <input name="name" value={form.name} onChange={handleInput} required placeholder="e.g. Fresh Sukuma Wiki" />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleInput} rows={3} placeholder="Tell customers about this product..." />
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label>Price (KES)</label>
          <input name="price" type="number" value={form.price} onChange={handleInput} required min="0" />
        </div>
        <div className="form-group">
          <label>Stock Quantity</label>
          <input name="stock_qty" type="number" value={form.stock_qty} onChange={handleInput} required min="0" />
        </div>
      </div>

      <div className="form-group">
        <label>Category</label>
        <select name="category" value={form.category} onChange={handleInput}>
          <option value="LOCAL_MARKET">Local Market</option>
          <option value="RESTAURANT">Restaurant</option>
        </select>
      </div>

      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input type="checkbox" name="is_available" id="is_available" checked={form.is_available} onChange={handleInput} />
        <label htmlFor="is_available" style={{ marginBottom: 0 }}>Available for Sale</label>
      </div>

      {product?.id && (
        <div className="form-group" style={{ padding: '16px', background: 'var(--navy-3)', borderRadius: '8px', border: '1px solid var(--border-2)' }}>
          <label style={{ display: 'block', marginBottom: '12px' }}>Product Image</label>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: 'var(--navy-2)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-2)' }}>
              {form.image_url ? <img src={form.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>No Image</div>}
            </div>
            <div style={{ flex: 1 }}>
              <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} style={{ fontSize: '12px' }} />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{uploading ? 'Uploading...' : 'JPG, PNG, WebP (Max 5MB)'}</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
          {loading ? 'Saving...' : product?.id ? 'Update Product' : 'Create Product'}
        </button>
        <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
