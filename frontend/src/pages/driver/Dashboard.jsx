import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import './Dashboard.css'
import toast from 'react-hot-toast'
import Earnings from './Earnings'

const STATUS_COLORS = {
  OUT_FOR_DELIVERY: '#42A5F5',
  DELIVERED: '#4CAF50',
  DISPUTE: '#EF5350',
}

export default function DriverDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('nearby')
  const [nearbyJobs, setNearbyJobs] = useState([])
  const [myDeliveries, setMyDeliveries] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [driverLocation, setDriverLocation] = useState(null)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const wsRef = useRef(null)

  // Initialize location tracking
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setDriverLocation({ lat: latitude, lng: longitude })
          updateDriverLocation(latitude, longitude)
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    }

    // Connect to WebSocket for real-time updates
    const wsUrl = `ws://localhost:8000/ws/driver-tracking/${user?.id}`
    wsRef.current = new WebSocket(wsUrl)
    wsRef.current.onopen = () => console.log('WebSocket connected')
    wsRef.current.onclose = () => console.log('WebSocket disconnected')

    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [user?.id])

  // Fetch driver data
  useEffect(() => {
    fetchDriverData()
    const interval = setInterval(fetchDriverData, 30000) // Every 30s
    return () => clearInterval(interval)
  }, [driverLocation])

  async function fetchDriverData() {
    setLoading(true)
    try {
      const [jobsRes, delivRes, statsRes] = await Promise.all([
        api.get('/driver/nearby-jobs', { params: { lat: driverLocation?.lat, lng: driverLocation?.lng } }),
        api.get('/orders'),
        api.get('/driver/profile/stats'),
      ])
      setNearbyJobs(jobsRes.data)
      setMyDeliveries(delivRes.data.filter(o => o.driver_id === user?.id))
      setStats(statsRes.data)
    } catch (err) {
      console.error('Error fetching driver data:', err)
    }
    setLoading(false)
  }

  async function updateDriverLocation(lat, lng) {
    try {
      await api.post('/driver/location/update', {
        driver_id: user?.id,
        lat,
        lng,
      })

      // Broadcast via WebSocket
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'location_update',
          lat,
          lng,
          timestamp: new Date().toISOString(),
        }))
      }
    } catch (err) {
      console.error('Error updating location:', err)
    }
  }

  async function acceptJob(jobId) {
    try {
      await api.post(`/driver/orders/${jobId}/accept`)
      fetchDriverData()
      alert('Job accepted! Head to the vendor for pickup.')
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || err.message))
    }
  }

  async function submitQRScan(orderId, qrValue) {
    if (!driverLocation) {
      alert('Please enable GPS before completing delivery.')
      return
    }

    try {
      const response = await api.post(`/driver/orders/${orderId}/handshake`, {
        order_id: orderId,
        qr_data: qrValue,
        driver_lat: driverLocation.lat,
        driver_lng: driverLocation.lng,
      })

      if (response.data.success) {
        alert('Delivery completed! Funds released.')
        fetchDriverData()
        setShowQRScanner(false)
        setSelectedOrderId(null)
      } else {
        alert(`Error: ${response.data.message}`)
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  async function reportNoShow(orderId) {
    if (!driverLocation) {
      alert('Please enable GPS first.')
      return
    }

    const file = new File(['placeholder'], 'photo.jpg', { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('order_id', orderId)
    formData.append('driver_lat', driverLocation.lat)
    formData.append('driver_lng', driverLocation.lng)
    formData.append('file', file)
    formData.append('notes', 'Customer not present at delivery location')

    try {
      await api.post(`/driver/orders/${orderId}/no-show`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('No-show reported with GPS evidence.')
      fetchDriverData()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  function renderNavigation() {
    return (
      <nav className="driver-nav">
        <div className="driver-logo">SokoYetu Driver</div>
        <div className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'nearby' ? 'active' : ''}`}
            onClick={() => setActiveTab('nearby')}
          >
            Nearby Jobs ({nearbyJobs.length})
          </button>
          <button
            className={`nav-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            My Deliveries ({myDeliveries.filter(o => o.status !== 'DELIVERED').length})
          </button>
          <button
            className={`nav-btn ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('earnings')}
          >
            Earnings
          </button>
          <button
            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button className="nav-btn logout" onClick={logout}>Logout</button>
        </div>
        <div className="driver-location">
          {driverLocation ? `${driverLocation.lat.toFixed(4)}, ${driverLocation.lng.toFixed(4)}` : 'Enable GPS'}
        </div>
      </nav>
    )
  }

  function renderNearbyJobs() {
    return (
      <div className="driver-nearby-view">
        <h2>Nearby Jobs ({nearbyJobs.length})</h2>
        {nearbyJobs.length === 0 ? (
          <div className="empty-state">
            <p>No nearby jobs available right now.</p>
            <p style={{fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px'}}>
              Enable location services and stay online to see new orders.
            </p>
          </div>
        ) : (
          <div className="jobs-list">
            {nearbyJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <div className="job-ref">{job.order_ref}</div>
                  <div className="job-distance" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '12px', gap: '4px' }}>
                    {driverLocation && job.vendor?.location_lat ? (
                      <span style={{ color: 'var(--accent)', fontWeight: 700, background: 'rgba(233,69,96,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        {(
                          Math.sqrt(
                            Math.pow(job.vendor.location_lat - driverLocation.lat, 2) +
                            Math.pow(job.vendor.location_lng - driverLocation.lng, 2)
                          ) * 111
                        ).toFixed(1)} km to pickup
                      </span>
                    ) : 'Distance unknown'}
                    
                    {driverLocation && job.delivery_lat ? (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                        {(
                          Math.sqrt(
                            Math.pow(job.delivery_lat - driverLocation.lat, 2) +
                            Math.pow(job.delivery_lng - driverLocation.lng, 2)
                          ) * 111
                        ).toFixed(1)} km delivery drop-off
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="job-details">
                  <p style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <strong>Pickup from:</strong> 
                    <span style={{ fontWeight: 600 }}>{job.vendor?.business_name || job.vendor?.name || 'Vendor'}</span>
                    {job.vendor?.is_verified_vendor && (
                      <span style={{ fontSize: '11px', background: '#e8f5e9', color: '#2e7d32', padding: '2px 6px', borderRadius: '4px', border: '1px solid #c8e6c9', display: 'inline-flex', alignItems: 'center' }}>
                        Verified Badge
                      </span>
                    )}
                  </p>
                  {job.vendor?.location_address && (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '110px', marginTop: '-4px' }}>
                      ↳ {job.vendor.location_address}
                    </p>
                  )}
                  <p><strong>Delivery to:</strong> {job.delivery_address}</p>
                  <p><strong>Items:</strong> {job.items?.length || 0}</p>
                  <p><strong>Fee:</strong> <span style={{color: 'var(--accent)', fontWeight: 600}}>KES {job.delivery_fee}</span></p>
                </div>
                <button className="btn btn-success" onClick={() => acceptJob(job.id)}>
                  Accept Job
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  function renderActiveDeliveries() {
    const active = myDeliveries.filter(o => o.status !== 'DELIVERED')
    const completed = myDeliveries.filter(o => o.status === 'DELIVERED')

    return (
      <div className="driver-active-view">
        <h2>My Deliveries</h2>

        <div className="deliveries-section">
          <h3>In Progress ({active.length})</h3>
          <div className="jobs-list">
            {active.length === 0 ? (
              <p style={{color: 'var(--text-muted)'}}>No active deliveries.</p>
            ) : active.map(delivery => (
              <div key={delivery.id} className="job-card active">
                <div className="job-header">
                  <div className="job-ref">{delivery.order_ref}</div>
                  <div className="badge" style={{background: STATUS_COLORS[delivery.status]}}>{delivery.status}</div>
                </div>
                <div className="job-details">
                  <p><strong>Customer:</strong> {delivery.customer?.name}</p>
                  <p><strong>Deliver to:</strong> {delivery.delivery_address}</p>
                  <p><strong>You earn:</strong> <span style={{color: 'var(--accent)'}}>KES {delivery.driver_earnings}</span></p>
                </div>
                <div className="delivery-actions">
                  {delivery.status === 'OUT_FOR_DELIVERY' && (
                    <>
                      <button className="btn btn-success" onClick={() => {
                        setSelectedOrderId(delivery.id)
                        setShowQRScanner(true)
                      }}>
                        Scan QR Code
                      </button>
                      <button className="btn btn-danger" onClick={() => reportNoShow(delivery.id)}>
                        No-Show Report
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <h3 style={{marginTop: '32px'}}>Completed ({completed.length})</h3>
          <div className="jobs-list">
            {completed.map(del => (
              <div key={del.id} className="job-card completed">
                <p><strong>{del.order_ref}</strong> • KES {del.driver_earnings} earned</p>
              </div>
            ))}
          </div>
        </div>

        {showQRScanner && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Scan Customer QR Code</h3>
              <input
                type="text"
                placeholder="QR Code Value (paste here)"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    submitQRScan(selectedOrderId, e.target.value)
                    e.target.value = ''
                  }
                }}
                className="input"
                style={{fontSize: '14px'}}
              />
              <button className="btn btn-secondary" onClick={() => {
                setShowQRScanner(false)
                setSelectedOrderId(null)
              }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  function renderProfile() {
    return (
      <div className="driver-profile-view">
        <h2>Your Profile</h2>
        <div className="profile-card">
          <div className="profile-header">
            {user?.profile_photo_url && (
              <img src={user.profile_photo_url} alt="Profile" className="profile-photo" />
            )}
            <div className="profile-info">
              <h3>{user?.name}</h3>
              <p className="text-muted">{user?.email}</p>
              {user?.student_id && (
                <p className="badge">{user.student_id} • {user.university}</p>
              )}
              {user?.course_major && (
                <p className="text-muted">{user.course_major} {user.year_of_study && `• ${user.year_of_study} Year`}</p>
              )}
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-number">{stats.deliveries_completed || 0}</div>
              <div className="stat-label">Deliveries Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">KES {(stats.estimated_earnings_khs || 0).toLocaleString()}</div>
              <div className="stat-label">Estimated Earnings</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{user?.is_active_driver ? 'Active' : 'Inactive'}</div>
              <div className="stat-label">Driver Status</div>
            </div>
          </div>

          <div className="driver-message" style={{marginTop: '24px', padding: '16px', background: '#E8F5E9', borderRadius: '8px', color: '#2E7D32'}}>
            <p><strong>Community Impact</strong></p>
            <p>Your deliveries support local vendors and the community. Thank you!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="driver-dashboard-layout">
      {renderNavigation()}
      <div className="driver-content">
        {loading && <div className="loading">Loading...</div>}
        {activeTab === 'nearby' && renderNearbyJobs()}
        {activeTab === 'active' && renderActiveDeliveries()}
        {activeTab === 'earnings' && <Earnings />}
        {activeTab === 'profile' && renderProfile()}
      </div>
    </div>
  )
}
