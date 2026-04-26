import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import ProductDetailsModal from '../components/ProductDetailsModal'

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/products/${id}`).then(r => setProduct(r.data)).catch(() => toast.error('Product not found')).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>
  if (!product) return <div style={{ padding:24 }}><Link to="/customer" className="btn btn-outline">← Back to shop</Link><h3 style={{ marginTop:12 }}>Product not found</h3></div>

  return (
    <div style={{ padding:24 }}>
      <Link to="/customer" className="btn btn-outline">← Back to shop</Link>
      <div style={{ marginTop:18 }}>
        <ProductDetailsModal product={product} onClose={() => { window.history.back() }} onAdd={() => { toast.success('Added to cart'); }} />
      </div>
    </div>
  )
}
