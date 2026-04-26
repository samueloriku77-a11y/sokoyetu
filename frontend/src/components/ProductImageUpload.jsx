import { useState } from 'react'
import api from '../../api'
import toast from 'react-hot-toast'

export default function ProductImageUpload({ productId, orderId, onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [sideName, setSideName] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      
      // Preview
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an image')
      return
    }
    if (!sideName) {
      toast.error('Please specify which side of the product (e.g., "front", "side", "back")')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('product_id', productId)
      if (orderId) formData.append('order_id', orderId)
      formData.append('side_name', sideName)

      const response = await api.post(
        `/vendor/products/${productId}/images`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      toast.success('✅ Image uploaded successfully')
      setFile(null)
      setSideName('')
      setPreview(null)
      
      if (onUploadSuccess) onUploadSuccess(response.data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to upload image')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        background: 'var(--navy-2)',
        border: '1px solid var(--border-2)',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '400px',
      }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
        📸 Upload Product Image
      </h3>

      {/* File Input */}
      <div
        style={{
          border: '2px dashed var(--border-2)',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginBottom: '16px',
        }}
        onClick={() => document.getElementById('file-input').click()}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
          />
        ) : (
          <>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Click to upload image
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              PNG, JPG, WEBP (max 10MB)
            </div>
          </>
        )}
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Side Name Input */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
          Product Side *
        </label>
        <select
          value={sideName}
          onChange={(e) => setSideName(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid var(--border-2)',
            background: 'var(--navy-3)',
            color: 'var(--text-primary)',
            fontSize: '13px',
          }}
        >
          <option value="">Select a side...</option>
          <option value="front">Front</option>
          <option value="back">Back</option>
          <option value="side">Side</option>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="detail">Detail</option>
        </select>
      </div>

      {/* Upload Button */}
      <button
        className="btn btn-primary btn-full"
        onClick={handleUpload}
        disabled={loading || !file || !sideName}
        style={{ opacity: (!file || !sideName) && !loading ? 0.5 : 1 }}
      >
        {loading ? 'Uploading...' : '⬆️ Upload Image'}
      </button>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
        💡 Minimum 2 images required for admin approval
      </div>
    </div>
  )
}
