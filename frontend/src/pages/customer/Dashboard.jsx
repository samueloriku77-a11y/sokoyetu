import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import DriverProfileCard from '../../components/DriverProfileCard'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import toast from 'react-hot-toast'
import LocationPicker from '../../components/LocationPicker'
import ARSizeViewer from '../../components/ARSizeViewer'
import ProductDetailsModal from '../../components/ProductDetailsModal'
import VendorBadge from '../../components/VendorBadge'
import Wallet from './Wallet'

const NAV = [
  { to:'/customer',        label:'Home' },
  { to:'/customer/orders', label:'My Orders' },
  { to:'/customer/wallet', label:'Wallet' },
  { to:'/customer/profile',label:'Profile' },
]

const STATUS_BADGE = {
  PENDING_PAYMENT:       { cls:'badge-pending',   label:'Awaiting Payment' },
  PENDING_VENDOR_APPROVAL:{ cls:'badge-pending',  label:'Pending Vendor' },
  ACCEPTED_BY_VENDOR:    { cls:'badge-accepted',  label:'Accepted' },
  OUT_FOR_DELIVERY:      { cls:'badge-delivery',  label:'Out for Delivery' },
  DELIVERED:             { cls:'badge-done',      label:'Delivered' },
  CANCELLED_BY_USER:     { cls:'badge-cancelled', label:'Cancelled' },
  DISPUTE:               { cls:'badge-dispute',   label:'Dispute' },
}

/* ── Product Card ───────────────────────────────────────── */

function ProductCard({ product, onAdd, onClick }) {
  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card card-interactive" style={{ padding:0, overflow:'hidden' }}>
        <div className="product-img-standard">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} />
          : <span style={{fontSize:14, color:'var(--text-muted)'}}>{product.category === 'RESTAURANT' ? 'Restaurant' : 'Market'}</span>
        }
        <span style={{ position:'absolute', top:10, right:10 }} className={`badge ${product.category==='RESTAURANT'?'badge-accepted':'badge-done'}`}>
          {product.category === 'RESTAURANT' ? 'Restaurant' : 'Market'}
        </span>
      </div>
        <div style={{ padding:'16px' }}>
        <h3 style={{ fontSize:15, fontWeight:600, marginBottom:6 }}>{product.name}</h3>
        <div style={{ marginBottom:8 }}>
          <VendorBadge name={(product.vendor && (product.vendor.business_name || product.vendor.name)) || 'Vendor'} />
        </div>
        <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:12, lineHeight:1.4 }}>{product.description || 'Fresh local product'}</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:12 }}>
          <span style={{ fontSize:18, fontWeight:700, color:'var(--accent)' }}>KES {product.price.toLocaleString()}</span>
          <button className="btn btn-primary btn-sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(product); }}>+ Add</button>
        </div>
      </div>
    </div>
  </Link>
  )
}

/* ── Cart Sidebar ───────────────────────────────────────── */
function Cart({ items, onRemove, onPlace, placing }) {
  const [isMinimized, setIsMinimized] = useState(false)
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  if (!items.length) return null

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        style={{
          position:'fixed', bottom:24, right:24, width:64, height:64, 
          background:'var(--accent)', borderRadius:'50%', 
          display:'flex', alignItems:'center', justifyContent:'center', 
          color:'white', fontSize:28, cursor:'pointer', 
          boxShadow:'var(--shadow-lg)', zIndex:200, animation:'fadeUp .3s ease'
        }}
        title="View Cart"
      >
        Cart
        <span style={{ 
          position:'absolute', top: -5, right: -5, 
          background:'#ef4444', color:'white', fontSize:12, fontWeight:700, 
          borderRadius:'50%', width:24, height:24, 
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {items.length}
        </span>
      </div>
    )
  }

  return (
    <div style={{ position:'fixed', bottom:24, right:24, width:320, background:'var(--navy-2)', border:'1px solid var(--border-2)', borderRadius:'var(--r-xl)', padding:20, boxShadow:'var(--shadow-lg)', zIndex:200, animation:'fadeUp .3s ease' }}>
      <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          Cart <span style={{ fontSize:12, background:'var(--accent)', color:'#fff', borderRadius:'999px', padding:'2px 8px' }}>{items.length}</span>
        </div>
        <button 
          onClick={() => setIsMinimized(true)} 
          style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:20, padding: 4 }}
          title="Minimize Cart"
        >
          &ndash;
        </button></h3>
      <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:200, overflowY:'auto', marginBottom:16 }}>
        {items.map(item => (
          <div key={item.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:13 }}>
            <span style={{ flex:1 }}>{item.name} ×{item.qty}</span>
            <span style={{ color:'var(--accent)', fontWeight:600, marginRight:8 }}>KES {(item.price*item.qty).toLocaleString()}</span>
            <button className="btn btn-ghost btn-sm" style={{ padding:'2px 6px' }} onClick={() => onRemove(item.id)}>✕</button>
          </div>
        ))}
      </div>
      <div className="divider" style={{ margin:'12px 0' }} />
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14, fontSize:15, fontWeight:700 }}>
        <span>Total</span><span style={{ color:'var(--accent)' }}>KES {total.toLocaleString()}</span>
      </div>
      <button className="btn btn-primary btn-full" onClick={onPlace} disabled={placing}>
        {placing ? 'Processing Payment...' : 'Pay with M-Pesa'}
      </button>
    </div>
  )
}

/* ── Shop Page ──────────────────────────────────────────── */
function Shop() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [cart, setCart] = useState([])
  const [phone, setPhone] = useState(user?.phone || '')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState(-1.2921)
  const [lng, setLng] = useState(36.8219)
  const [placing, setPlacing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [arProduct, setArProduct] = useState(null)

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data)).catch(() => toast.error('Failed to load products')).finally(() => setLoading(false))
  }, [])

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id)
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty+1 } : i)
      return [...prev, { ...product, qty:1 }]
    })
    toast.success(`${product.name} added!`, { duration:1500 })
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))

  const placeOrder = async () => {
    if (!cart.length) return
    if (!user) {
      toast.error('Please sign in to place orders')
      navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    if (!phone) { toast.error('Enter M-Pesa phone number'); return }
    if (!address) { toast.error('Enter delivery address'); return }
    const vendorId = cart[0].vendor_id
    setPlacing(true)
    try {
      await api.post('/orders', {
        vendor_id: vendorId,
        items: cart.map(i => ({ product_id: i.id, quantity: i.qty })),
        delivery_address: address,
        delivery_lat: lat,
        delivery_lng: lng,
        phone_number: phone.replace(/^0/, '254'),
      })
      toast.success('Order placed! Check your M-Pesa for STK Push.')
      setCart([])
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Order failed')
    } finally {
      setPlacing(false)
    }
  }

  const filtered = filter === 'ALL' ? products : products.filter(p => p.category === filter)

  return (
    <div style={{ padding:'32px 0' }}>
      {/* Community Banner */}
      <div style={{ background:'linear-gradient(135deg, rgba(74,222,128,.08), rgba(96,165,250,.06))', border:'1px solid rgba(74,222,128,.15)', borderRadius:'var(--r-xl)', padding:'24px 28px', marginBottom:32, display:'flex', gap:24, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ flex:1 }}>
          <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>
            Welcome back, {user?.name?.split(' ')[0]}
          </h2>
          <p style={{ color:'var(--text-secondary)', fontSize:13 }}>You've supported <strong style={{ color:'var(--green)' }}>{user?.vendors_supported || 0} local vendors</strong> this month. Keep it up!</p>
          <div style={{ marginTop:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>
              <span>Community Impact</span>
              <span>{Math.min((user?.vendors_supported||0)*20, 100)}%</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{ width:`${Math.min((user?.vendors_supported||0)*20, 100)}%` }} />
            </div>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>Help {Math.max(5-(user?.vendors_supported||0),0)} more vendors to reach Community Champion!</p>
          </div>
        </div>
      </div>

      {/* Delivery details */}
      {cart.length > 0 && (
        <div style={{ background:'var(--navy-2)', border:'1px solid var(--border-2)', borderRadius:'var(--r-lg)', padding:'16px 20px', marginBottom:24, display:'flex', flexDirection: 'column', gap:16 }}>
          <LocationPicker 
            onChange={(loc) => {
              setAddress(loc.address);
              setLat(loc.lat);
              setLng(loc.lng);
            }} 
          />
          <div style={{ flex:1, minWidth:180 }}>
            <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:4 }}>M-Pesa Phone</label>
            <input placeholder="0712345678" value={phone} onChange={e=>setPhone(e.target.value)} />
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {[['ALL','All Products'],['LOCAL_MARKET','Local Market'],['RESTAURANT','Restaurant']].map(([k,l]) => (
          <button key={k} className={`tag ${filter===k?'tag-active':'tag-inactive'}`} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>

      {loading
        ? <div className="loading-center"><div className="spinner" /></div>
        : filtered.length === 0
          ? <div className="empty-state"><h3>No products yet</h3><p>Vendors haven't listed any products in this category.</p></div>
          : <div className="grid-4">{filtered.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} onClick={setSelectedProduct} />)}</div>
      }

      <Cart items={cart} onRemove={removeFromCart} onPlace={placeOrder} placing={placing} />
      
      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAdd={addToCart}
          onAR={() => { setArProduct(selectedProduct); setSelectedProduct(null); }}
        />
      )}

      {arProduct && <ARSizeViewer product={arProduct} onClose={() => setArProduct(null)} />}
    </div>
  )
}

/* ── My Orders Page ─────────────────────────────────────── */
function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [qrData, setQrData] = useState(null)

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  const cancel = async (id) => {
    try {
      const r = await api.post(`/orders/${id}/cancel`)
      toast.success(r.data.message)
      setOrders(prev => prev.map(o => o.id===id ? { ...o, status:'CANCELLED_BY_USER' } : o))
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Cannot cancel')
    }
  }

  const showQR = async (id) => {
    try {
      const r = await api.get(`/orders/${id}/qr`)
      setQrData(r.data)
    } catch { toast.error('QR not available yet') }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div style={{ padding:'32px 0' }}>
      <h2 style={{ fontSize:24, fontWeight:700, marginBottom:24 }}>My Orders</h2>
      {orders.length === 0
        ? <div className="empty-state"><h3>No orders yet</h3><p>Start shopping to place your first order!</p><Link to="/customer" className="btn btn-primary" style={{ marginTop:8 }}>Browse Products</Link></div>
        : <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {orders.map(order => {
              const s = STATUS_BADGE[order.status] || { cls:'badge-pending', label:order.status }
              return (
                <div key={order.id} className="card fade-up">
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap', marginBottom:16 }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                        <span style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:16 }}>{order.order_ref}</span>
                        <span className={`badge ${s.cls}`}>{s.label}</span>
                      </div>
                      <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:8 }}>{new Date(order.created_at).toLocaleString()} · {order.items?.length || 0} item(s)</p>
                      <div style={{ display:'flex', gap:16 }}>
                        <span style={{ fontSize:14 }}>Subtotal: <strong>KES {order.total_amount.toLocaleString()}</strong></span>
                        <span style={{ fontSize:14 }}>Delivery: <strong>KES {order.delivery_fee}</strong></span>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {order.status === 'PENDING_VENDOR_APPROVAL' && (
                        <button className="btn btn-danger btn-sm" onClick={() => cancel(order.id)}>Cancel & Refund</button>
                      )}
                      {['OUT_FOR_DELIVERY','ACCEPTED_BY_VENDOR'].includes(order.status) && (
                        <button className="btn btn-success btn-sm" onClick={() => showQR(order.id)}>Show QR Code</button>
                      )}
                    </div>
                  </div>

                  {/* Driver Profile Card - Show when order is assigned to driver */}
                  {order.driver_id && (
                    <>
                      <div style={{ borderTop:'1px solid var(--border-2)', paddingTop:'16px' }}>
                        <p style={{ fontSize:'12px', color:'var(--text-secondary)', marginBottom:'12px', fontWeight:'600' }}>Your Delivery Partner</p>
                        <DriverProfileCard orderId={order.id} />
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
      }

      {/* QR Modal */}
      {qrData && (
        <div className="modal-overlay" onClick={() => setQrData(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>Your Delivery QR Code</h3>
            <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>Show this to your driver at the door. They must scan it within 15m of your location.</p>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
              <div className="qr-box">
                <img src={qrData.qr_code} alt="QR Code" style={{ width:220, height:220 }} />
              </div>
              <div style={{ background:'var(--navy-3)', borderRadius:'var(--r-md)', padding:'10px 16px', width:'100%', textAlign:'center' }}>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>Order Reference</p>
                <p style={{ fontFamily:'monospace', fontSize:18, fontWeight:700, color:'var(--accent)' }}>{qrData.order_ref}</p>
              </div>
              <p style={{ fontSize:12, color:'var(--text-muted)', textAlign:'center' }}>🔒 GPS-verified handshake required · Funds held in escrow until delivery</p>
            </div>
            <button className="btn btn-outline btn-full" style={{ marginTop:20 }} onClick={() => setQrData(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Profile Page ───────────────────────────────────────── */
function Profile() {
  const { user } = useAuth()
  const impact = Math.min((user?.vendors_supported||0)*20, 100)
  return (
    <div style={{ padding:'32px 0', maxWidth:600 }}>
      <h2 style={{ fontSize:24, fontWeight:700, marginBottom:24 }}>My Profile</h2>
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:20 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#fff' }}>{user?.name?.[0]}</div>
          <div>
            <h3 style={{ fontSize:20, fontWeight:700 }}>{user?.name}</h3>
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>{user?.email}</p>
            <span className="badge badge-done" style={{ marginTop:4 }}>CUSTOMER</span>
          </div>
        </div>

        <div className="divider" />

        <div>
          <p style={{ fontSize:13, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:12 }}>Community Impact</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            <div style={{ background:'var(--navy-3)', borderRadius:'var(--r-md)', padding:'14px 16px', textAlign:'center' }}>
              <div style={{ fontSize:28, fontWeight:800, color:'var(--green)' }}>{user?.vendors_supported||0}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>Vendors Supported</div>
            </div>
            <div style={{ background:'var(--navy-3)', borderRadius:'var(--r-md)', padding:'14px 16px', textAlign:'center' }}>
              <div style={{ fontSize:28, fontWeight:800, color:'var(--blue-light)' }}>Impact</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>Community Member</div>
            </div>
          </div>
          <div style={{ marginBottom:6, display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text-secondary)' }}>
            <span>Community Champion Progress</span><span style={{ fontWeight:600, color:'var(--green)' }}>{impact}%</span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width:`${impact}%` }} />
          </div>
          <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:6 }}>
            {impact >= 100 ? '🏆 You are a Community Champion!' : `Support ${Math.max(5-(user?.vendors_supported||0),0)} more vendors to reach Community Champion!`}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Dashboard Shell ────────────────────────────────────── */
export default function CustomerDashboard() {
  return (
    <div className="page">
      <Navbar links={NAV} />
      <div className="container">
        <Routes>
          <Route index    element={<Shop />} />
          <Route path="orders"  element={<MyOrders />} />
          <Route path="wallet"  element={<Wallet />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  )
}
