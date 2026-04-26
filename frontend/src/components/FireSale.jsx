import React, { useEffect, useState } from 'react'
import VendorBadge from './VendorBadge'
import { Link } from 'react-router-dom'
import api from '../api'

export default function FireSale() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch available products and show first 6 as Fire Sale (could be improved server-side)
    api.get('/products').then(r => {
      const items = (r.data || []).filter(p => p.is_available).slice(0,6)
      setProducts(items)
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  return (
    <section style={{ padding: '40px 5vw', background: 'rgba(0,0,0,0.15)' }}>
      <h3 style={{ color:'#fff', marginBottom:16 }}>🔥 Fire Sale — Limited Time</h3>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16 }}>
        {products.map(p => (
          <Link key={p.id} to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ background:'rgba(255,255,255,0.04)', padding:12, cursor: 'pointer' }}>
              <div className="product-img-standard">
                <img src={p.image_url || '/assets/sample1.jpg'} alt={p.name} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
                <div>
                  <div style={{ color:'#fff', fontWeight:700 }}>{p.name}</div>
                  <div style={{ color:'rgba(255,255,255,0.75)', fontSize:13 }}>KES {p.price}</div>
                </div>
                <VendorBadge name={(p.vendor && (p.vendor.business_name || p.vendor.name)) || 'Vendor'} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
