import { useState, useEffect } from 'react'
import api from '../api'

export default function DriverProfileCard({ orderId }) {
  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    const fetchDriver = async () => {
      try {
        const res = await api.get(`/customer/orders/${orderId}/driver`)
        setDriver(res.data.driver_profile)
        setError(null)
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load driver info')
        setDriver(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDriver()
  }, [orderId])

  if (loading) return null
  if (!driver) return null

  const initials = driver.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)',
      border: '2px solid rgba(59,130,246,0.3)',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
    }}>
      {/* Avatar */}
      <div style={{
        width: '60px',
        height: '60px',
        minWidth: '60px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '18px',
        fontWeight: '800',
      }}>
        {driver.profile_photo_url ? (
          <img
            src={driver.profile_photo_url}
            alt={driver.name}
            style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }}
          />
        ) : (
          initials
        )}
      </div>

      {/* Driver Info */}
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '6px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
            {driver.name}
          </h3>
          {driver.deliveries_completed >= 10 && (
            <span style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color: '#78350f',
              fontSize: '12px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '14px',
            }}>
              ⭐ Trusted
            </span>
          )}
        </div>
        
        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
        }}>
          <div>
            <span style={{ fontWeight: '700', color: 'var(--accent)' }}>
              {driver.deliveries_completed}
            </span>
            {' '}deliveries
          </div>
          {driver.university && (
            <div>📚 {driver.university}</div>
          )}
        </div>

        {/* Safety Message */}
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          🛡️ Verified delivery partner
        </div>
      </div>

      {/* Call Button - Shows icon only, no phone number */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <button style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 12px',
          color: 'white',
          fontWeight: '700',
          cursor: 'pointer',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          📞 Call
        </button>
        <div style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}>
          #no direct contact
        </div>
      </div>
    </div>
  )
}
