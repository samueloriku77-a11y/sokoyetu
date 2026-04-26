import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import LocationPicker from '../components/LocationPicker'

const ROLES = [
  { id: 'CUSTOMER', label: 'Customer', desc: 'Browse and order from local vendors' },
  { id: 'VENDOR', label: 'Vendor', desc: 'Sell your products on the platform' },
  { id: 'DRIVER', label: 'Driver', desc: 'Earn by delivering as a student' },
]

export default function Register({ initialRole }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [role, setRole] = useState(() => {
    if (initialRole) return initialRole
    const r = searchParams.get('role')?.toUpperCase()
    return ROLES.find(x => x.id === r) ? r : 'CUSTOMER'
  })
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    student_id: '', university: '', course_major: '', year_of_study: '',
    business_name: '', location_address: '', location_lat: null, location_lng: null
  })

  const getSimulatedLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setForm(f => ({ ...f, location_lat: pos.coords.latitude, location_lng: pos.coords.longitude }))
        toast.success('Location captured!')
      }, () => toast.error('Enable location services'))
    } else {
      toast.error('Geolocation not supported')
    }
  }

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/register', { ...form, role })
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 24px', background: 'radial-gradient(ellipse at 70% 30%, rgba(74,222,128,.06) 0%, transparent 50%), var(--navy)' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/">
            <img src="/logo.jpeg" alt="SokoYetu Logo" style={{ height: "64px", width: "auto" }} />
          </Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Support your local community</p>
        </div>

        {/* Role picker */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {ROLES.map(r => (
            <button key={r.id} type="button" onClick={() => setRole(r.id)}
              style={{ flex: 1, padding: '12px 8px', borderRadius: 'var(--r-md)', border: `2px solid ${role === r.id ? 'var(--accent)' : 'var(--border)'}`, background: role === r.id ? 'rgba(233,69,96,.1)' : 'var(--navy-2)', cursor: 'pointer', transition: 'all .2s', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{r.label.split(' ')[0]}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: role === r.id ? 'var(--accent)' : 'var(--text-primary)' }}>{r.label.split(' ').slice(1).join(' ')}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{r.desc}</div>
            </button>
          ))}
        </div>

        <div className="card" style={{ background: 'var(--navy-2)', border: '1px solid var(--border-2)' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="grid-2">
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" placeholder="Jane Mwangi" value={form.name} onChange={handle} required />
              </div>
              <div className="form-group">
                <label>Phone (M-Pesa)</label>
                <input name="phone" placeholder="0712345678" value={form.phone} onChange={handle} />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" placeholder="jane@example.com" value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" placeholder="Min 8 characters" value={form.password} onChange={handle} required minLength={8} />
            </div>

            {/* Vendor-only fields */}
            {role === 'VENDOR' && (
              <div style={{ padding:'16px', background:'rgba(251,191,36,.05)', borderRadius:'var(--r-md)', border:'1px solid rgba(251,191,36,.15)', marginBottom:12 }}>
                <p style={{ fontSize:12, color:'var(--gold)', fontWeight:600, marginBottom:12, textTransform:'uppercase', letterSpacing:'.5px' }}>Business Details</p>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div className="form-group">
                    <label>Business Name *</label>
                    <input name="business_name" placeholder="e.g. Mama Njeri Veggies" value={form.business_name} onChange={handle} required={role==='VENDOR'} />
                  </div>
                  <LocationPicker 
                    onChange={(loc) => setForm(f => ({ ...f, location_address: loc.address, location_lat: loc.lat, location_lng: loc.lng }))} 
                  />
                </div>
              </div>
            )}

            {/* Driver-only fields */}
            {role === 'DRIVER' && (
              <div style={{ padding: '16px', background: 'rgba(74,222,128,.05)', borderRadius: 'var(--r-md)', border: '1px solid rgba(74,222,128,.15)' }}>
                <p style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>Student Driver Details</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="form-group">
                    <label>University Student ID *</label>
                    <input name="student_id" placeholder="e.g. UON/CS/2024/001" value={form.student_id} onChange={handle} required={role === 'DRIVER'} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>This is unique — one account per student ID</span>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>University</label>
                      <input name="university" placeholder="UoN, JKUAT, KU…" value={form.university} onChange={handle} />
                    </div>
                    <div className="form-group">
                      <label>Year of Study</label>
                      <select name="year_of_study" value={form.year_of_study} onChange={handle}>
                        <option value="">Select year</option>
                        {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgrad'].map(y => <option key={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Course / Major</label>
                    <input name="course_major" placeholder="Computer Science, Business…" value={form.course_major} onChange={handle} />
                  </div>
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Creating account…' : `Create ${role.charAt(0) + role.slice(1).toLowerCase()} Account →`}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
