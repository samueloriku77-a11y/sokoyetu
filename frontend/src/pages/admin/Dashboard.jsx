import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import toast from 'react-hot-toast'
import ProductEditForm from '../../components/ProductEditForm'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [pendingOrders, setPendingOrders] = useState([])
  const [unverifiedVendors, setUnverifiedVendors] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [images, setImages] = useState([])
  const [notes, setNotes] = useState('')
  const [products, setProducts] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDashboard()
    const interval = setInterval(loadDashboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboard = async () => {
    try {
      const [statsRes, ordersRes, vendorsRes, productsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/orders/pending'),
        api.get('/admin/vendors/unverified'),
        api.get('/admin/products')
      ])
      setStats(statsRes.data)
      setPendingOrders(ordersRes.data)
      setUnverifiedVendors(vendorsRes.data)
      setProducts(productsRes.data)
    } catch (err) {
      console.error('Dashboard error:', err)
    }
  }

  const loadOrderDetails = async (orderId) => {
    try {
      const res = await api.get(`/admin/orders/${orderId}`)
      setSelectedOrder(res.data)
      setImages(res.data.product_images || [])
    } catch (err) {
      toast.error('Failed to load order details')
    }
  }

  const approveOrder = async (approved) => {
    if (!selectedOrder) return
    setLoading(true)
    try {
      await api.post(`/admin/orders/${selectedOrder.id}/approve`, { approved, notes })
      toast.success(approved ? 'Order approved!' : 'Order rejected')
      setSelectedOrder(null)
      setNotes('')
      loadDashboard()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to process order')
    } finally {
      setLoading(false)
    }
  }

  const verifyVendor = async (vendorId) => {
    try {
      setLoading(true)
      await api.post(`/admin/vendors/${vendorId}/verify`)
      toast.success('Vendor verified!')
      loadDashboard()
    } catch (err) {
      toast.error('Failed to verify vendor')
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (productId) => {
    if (!window.confirm('Delete product?')) return
    try {
      await api.delete(`/vendor/products/${productId}`)
      toast.success('Product deleted')
      loadDashboard()
    } catch (err) {
      toast.error('Failed to delete product')
    }
  }

  const promoteAdmin = async () => {
    const email = prompt('Email to promote to ADMIN:')
    if (!email) return
    try {
      await api.post('/admin/promote-admin', { email })
      toast.success('Promoted to ADMIN!')
      loadDashboard()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,var(--navy) 0%,var(--navy-2) 100%)' }}>
      <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)', padding: '20px 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px', background: 'linear-gradient(135deg, rgba(233,69,96,1) 0%, rgba(245,158,11,1) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Admin Control Panel
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Welcome, {user?.name}</p>
            </div>
            <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '8px', padding: '10px 16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Status</div>
              <div style={{ color: '#34d399', fontWeight: '700' }}>● Active</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid var(--border)', padding: '0 24px', position: 'sticky', top: '70px', zIndex: 99 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '24px' }}>
          {['overview', 'review', 'vendors', 'products', 'duties'].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSelectedOrder(null) }} style={{
              padding: '16px 0',
              borderBottom: activeTab === tab ? '3px solid var(--accent)' : 'transparent',
              background: 'none', border: 'none', color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab ? '700' : '500', cursor: 'pointer', fontSize: '14px'
            }}>
              {tab === 'overview' && 'Overview'}
              {tab === 'review' && `Review (${pendingOrders.length})`}
              {tab === 'vendors' && `Vendors (${unverifiedVendors.length})`}
              {tab === 'products' && `Products (${products.length})`}
              {tab === 'duties' && 'Admin Tools'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {activeTab === 'overview' && (
          <div>
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {[
                  { label: 'Pending Approval', value: stats.total_pending_orders },
                  { label: 'Unverified Images', value: stats.pending_images_count },
                  { label: 'Total Revenue', value: `KES ${stats.total_revenue?.toLocaleString()}` },
                  { label: 'Total Vendors', value: stats.total_vendors },
                  { label: 'Total Drivers', value: stats.total_drivers },
                  { label: 'Total Customers', value: stats.total_customers },
                ].map((stat, idx) => (
                  <div key={idx} style={{ background: 'var(--navy-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{stat.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent)' }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'duties' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'white', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '12px' }}>👑 Promote to Admin</h3>
              <button onClick={promoteAdmin} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '12px 24px', color: 'white', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
                Promote User → Admin
              </button>
              <p style={{ fontSize: '12px', opacity: 0.9, marginTop: '12px' }}>Enter user email</p>
            </div>

            <div style={{ background: 'var(--navy-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <h4 style={{ marginBottom: '12px' }}>Unverified Products</h4>
              {products.filter(p => !p.is_verified).length > 0 ? (
                products.filter(p => !p.is_verified).slice(0,3).map(p => (
                  <div key={p.id} style={{ display: 'flex', gap: '12px', padding: '12px', borderBottom: '1px solid var(--border-2)', alignItems: 'center' }}>
                    <img src={p.image_url} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div>
                      <div style={{ fontWeight: '600' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.vendor?.name}</div>
                    </div>
                    <button style={{ marginLeft: 'auto', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px' }} onClick={async () => {
                      await api.post(`/admin/verify-product/${p.id}`)
                      toast.success('Verified!')
                      loadDashboard()
                    }}>
                      Verify
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No unverified products</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'review' && pendingOrders.length > 0 && (
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <h3>Pending Orders ({pendingOrders.length})</h3>
              {pendingOrders.slice(0,5).map(order => (
                <div key={order.id} style={{ background: 'var(--navy-3)', padding: '16px', borderRadius: '8px', marginBottom: '12px', cursor: 'pointer' }} onClick={() => loadOrderDetails(order.id)}>
                  <div>{order.order_ref}</div>
                  <div>KES {order.total_amount}</div>
                </div>
              ))}
            </div>
            {selectedOrder && (
              <div style={{ flex: 2 }}>
                <h3>Review #{selectedOrder.order_ref}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', margin: '20px 0' }}>
                  {images.map(img => (
                    <img key={img.id} src={img.image_url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px' }} />
                  ))}
                </div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Admin notes" style={{ width: '100%', height: '100px', marginBottom: '12px' }} />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => approveOrder(true)} style={{ flex: 1, background: '#22c55e', color: 'white', padding: '12px' }}>Approve</button>
                  <button onClick={() => approveOrder(false)} style={{ flex: 1, background: '#ef4444', color: 'white', padding: '12px' }}>Reject</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
