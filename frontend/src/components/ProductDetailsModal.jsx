import React from 'react';
import './ProductDetailsModal.css';

export default function ProductDetailsModal({ product, onClose, onAdd, onAR }) {
  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="product-modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="product-details-grid">
          <div className="product-visual">
            <div className="product-img-standard" style={{ borderRadius: 0 }}>
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} />
              ) : (
                <div className="no-image-placeholder">No Image</div>
              )}
            </div>
          </div>
          
          <div className="product-info-panel">
            <span className={`badge ${product.category === 'RESTAURANT' ? 'badge-accepted' : 'badge-done'}`} style={{ marginBottom: '12px', display: 'inline-block' }}>
              {product.category === 'RESTAURANT' ? 'Restaurant' : 'Local Market'}
            </span>
            
            <h2 className="product-title">{product.name}</h2>
            <div className="product-price">KES {product.price.toLocaleString()}</div>
            
            <div className="product-description-label">Description</div>
            <p className="product-description">
              {product.description || 'This is a premium local product sourced with care.'}
            </p>
            
            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">Availability:</span>
                <span className="meta-value">{product.stock_qty > 0 ? 'In Stock' : 'Out of Stock'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Vendor:</span>
                <span className="meta-value">{(product.vendor && (product.vendor.business_name || product.vendor.name)) || `#${product.vendor_id}`}</span>
              </div>
            </div>
            
            <div className="product-actions-group">
              <button 
                className="btn btn-primary btn-lg btn-full" 
                onClick={() => { onAdd(product); onClose(); }}
                disabled={product.stock_qty <= 0}
              >
                Add to Cart
              </button>
              
              <button 
                className="btn btn-outline btn-lg btn-full" 
                onClick={onAR}
              >
                <span style={{ marginRight: '8px' }}>👓</span>
                View in AR Space
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
