import React from 'react'

export default function VendorBadge({ name }) {
  return (
    <div className="badge" style={{ background: 'rgba(255,255,255,0.08)', color:'#fff', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 10px' }}>
      {name || 'Unknown Vendor'}
    </div>
  )
}
