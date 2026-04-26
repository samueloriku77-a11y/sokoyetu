import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import toast from 'react-hot-toast'
import ProductEditForm from '../../components/ProductEditForm'
import Revenue from './Revenue'

const NAV = [
  { to:'/vendor',          label:'Dashboard' },
  { to:'/vendor/orders',   label:'Orders' },
  { to:'/vendor/products', label:'Products' },
  { to:'/vendor/revenue',  label:'Revenue' },
]

const STATUS_BADGE = {
  PENDING_VENDOR_APPROVAL: { cls:'badge-pending',  label:'Awaiting Your Approval', accent:'var(--gold)' },
  ACCEPTED_BY_VENDOR:      { cls:'badge-accepted', label:'Preparing',              accent:'var(--blue-light)' },
  OUT_FOR_DELIVERY:        { cls:'badge-delivery', label:'Out for Delivery',        accent:'var(--purple)' },
  DELIVERED:               { cls:'badge-done',     label:'Delivered',              accent:'var(--green)' },
  CANCELLED_BY_USER:       { cls:'badge-cancelled',label:'Cancelled',              accent:'#f87171' },
  DISPUTE:                 { cls:'badge-dispute',  label:'Dispute',                accent:'var(--gold)' },
}

/* ── Stats Row ──────────────────────────────────────────── */
function StatsRow({ orders }) {
  const pending  = orders.filter(o => o.status==='PENDING_VENDOR_APPROVAL').length
  const active   = orders.filter(o => ['ACCEPTED_BY_VENDOR','OUT_FOR_DELIVERY'].includes(o.status)).length
  const done     = orders.filter(o => o.status==='DELIVERED').length
  const revenue  = orders.filter(o => o.status==='DELIVERED').reduce((s,o) => s+o.total_amount, 0)
  return (
    <div className="grid-4" style={{ marginBottom:32 }}>
      {[
        { label:'Pending Approval', value:pending, color:'var(--gold)',       icon:'' },
        { label:'Active Orders',    value:active,  color:'var(--blue-light)', icon:'' },
        { label:'Delivered',        value:done,    color:'var(--green)',       icon:'' },
        { label:'Revenue (KES)',    value:`${revenue.toLocaleString()}`, color:'var(--accent)', icon:'' },
      ].map(s => (
        <div className="stat-card" key={s.label}>
          <div style={{ fontSize:28 }}>{s.icon}</div>
          <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

/* ── Orders Table ───────────────────────────────────────── */
function OrdersTable({ orders, onAccept, onReady }) {
  if (!orders.length) return (
    <div className="empty-state"><h3>No orders yet</h3><p>When customers place orders, they'll appear here.</p></div>
  )
  return (
    <div className="card" style={{ padding:0, overflow:'hidden' }}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order Ref</th><th>Customer</th><th>Items</th>
              <th>Amount</th><th>Status</th><th>Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const s = STATUS_BADGE[order.status] || { cls:'badge-pending', label:order.status, accent:'var(--text-muted)' }
              return (
                <tr key={order.id}>
                  <td><span style={{ fontFamily:'Space Grotesk', fontWeight:700, color:'var(--accent)' }}>{order.order_ref}</span></td>
                  <td style={{ color:'var(--text-secondary)', fontSize:13 }}>Customer #{order.customer_id}</td>
                  <td style={{ color:'var(--text-secondary)', fontSize:13 }}>{order.items?.length||0} item(s)</td>
                  <td><strong>KES {order.total_amount.toLocaleString()}</strong></td>
                  <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                  <td style={{ color:'var(--text-muted)', fontSize:12 }}>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      {order.status==='PENDING_VENDOR_APPROVAL' && (
                        <button className="btn btn-success btn-sm" onClick={() => onAccept(order.id)}>ACCEPT</button>
                      )}
                      {order.status==='ACCEPTED_BY_VENDOR' && (
                        <button className="btn btn-primary btn-sm" onClick={() => onReady(order.id)}>OUT FOR DELIVERY</button>
                      )}
                      {!['PENDING_VENDOR_APPROVAL','ACCEPTED_BY_VENDOR'].includes(order.status) && (
                        <span style={{ fontSize:12, color:'var(--text-muted)' }}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Orders Page ────────────────────────────────────────── */
function VendorOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => api.get('/vendor/orders').then(r => setOrders(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const accept = async (id) => {
    try {
      const r = await api.post(`/vendor/orders/${id}/accept`)
      toast.success(`Order accepted! Vendor key: ${r.data.vendor_key_part_a}`)
      load()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed') }
  }

  const markReady = async (id) => {
    try {
      await api.post(`/vendor/orders/${id}/ready`)
      toast.success('Order marked — drivers can now see this job')
      load()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed') }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div style={{ padding:'32px 0' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <h2 style={{ fontSize:24, fontWeight:700 }}>Orders</h2>
        <button className="btn btn-outline btn-sm" onClick={load}>↻ Refresh</button>
      </div>
      <StatsRow orders={orders} />
      <OrdersTable orders={orders} onAccept={accept} onReady={markReady} />
    </div>
  )
}

/* ── Products Page ──────────────────────────────────────── */
function VendorProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const load = () => api.get('/vendor/products').then(r => setProducts(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleSave = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    load();
  };


  const toggle = async (p) => {
    try {
      await api.put(`/vendor/products/${p.id}`, { is_available: !p.is_available })
      toast.success(p.is_available ? 'Product hidden' : 'Product visible')
      load()
    } catch { toast.error('Failed') }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try { await api.delete(`/vendor/products/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div style={{ padding:'32px 0' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h2 style={{ fontSize:24, fontWeight:700 }}>My Products</h2>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>+ Add Product</button>
      </div>

      {(showAddForm || editingProduct) && (
        <div className="modal-overlay" onClick={() => { setShowAddForm(false); setEditingProduct(null); }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth:'450px' }}>
            <h3 style={{ fontSize:20, fontWeight:700, marginBottom:20 }}>
              {editingProduct ? `Edit Product #${editingProduct.id}` : 'New Product'}
            </h3>
            <ProductEditForm 
              product={editingProduct} 
              onSave={handleSave} 
              onCancel={() => { setShowAddForm(false); setEditingProduct(null); }} 
            />
          </div>
        </div>
      )}

      {products.length === 0
        ? <div className="empty-state"><h3>No products listed</h3><p>Add your first product to start receiving orders.</p></div>
        : <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong><br/><span style={{ fontSize:12, color:'var(--text-muted)' }}>{p.description?.slice(0,40)}</span></td>
                      <td><span className={`badge ${p.category==='RESTAURANT'?'badge-accepted':'badge-done'}`}>{p.category==='RESTAURANT'?'Restaurant':'Market'}</span></td>
                      <td><strong style={{ color:'var(--accent)' }}>KES {p.price.toLocaleString()}</strong></td>
                      <td>{p.stock_qty}</td>
                      <td><span className={`badge ${p.is_available?'badge-done':'badge-cancelled'}`}>{p.is_available?'Available':'Hidden'}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => setEditingProduct(p)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      }
    </div>
  )
}

/* ── Dashboard Home ─────────────────────────────────────── */
function VendorHome() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  useEffect(() => { api.get('/vendor/orders').then(r => setOrders(r.data)).catch(() => {}) }, [])

  const pending = orders.filter(o => o.status==='PENDING_VENDOR_APPROVAL')
  return (
    <div style={{ padding:'32px 0' }}>
      <h2 style={{ fontSize:24, fontWeight:700, marginBottom:8 }}>Vendor Dashboard</h2>
      <p style={{ color:'var(--text-muted)', marginBottom:32 }}>Welcome back, <strong>{user?.name}</strong></p>
      <StatsRow orders={orders} />

      {pending.length > 0 && (
        <div style={{ background:'linear-gradient(135deg,rgba(251,191,36,.08),transparent)', border:'1px solid rgba(251,191,36,.2)', borderRadius:'var(--r-lg)', padding:'20px 24px', marginBottom:24 }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:'var(--gold)', marginBottom:12 }}>{pending.length} Order(s) Awaiting Your Approval</h3>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {pending.map(o => (
              <Link key={o.id} to="/vendor/orders" style={{ background:'rgba(251,191,36,.1)', border:'1px solid rgba(251,191,36,.2)', borderRadius:'var(--r-sm)', padding:'8px 14px', fontSize:13, fontWeight:600, color:'var(--gold)' }}>
                {o.order_ref} — KES {o.total_amount}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:12 }}>
        <Link to="/vendor/orders"   className="btn btn-primary">Orders</Link>
        <Link to="/vendor/products" className="btn btn-outline">Products</Link>
      </div>
    </div>
  )
}

/* ── Shell ──────────────────────────────────────────────── */
export default function VendorDashboard() {
  return (
    <div className="page">
      <Navbar links={NAV} />
      <div className="container">
        <Routes>
          <Route index         element={<VendorHome />} />
          <Route path="orders"   element={<VendorOrders />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="revenue"  element={<Revenue />} />
        </Routes>
      </div>
    </div>
  )
}
