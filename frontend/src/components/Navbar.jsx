import { useAuth } from '../context/AuthContext'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Navbar({ role, links = [] }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleColor = { CUSTOMER:'var(--accent)', VENDOR:'var(--blue-light)', DRIVER:'var(--green)' }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img src="/logo.jpeg" alt="SokoYetu Logo" className="navbar-logo" style={{ height: "64px" }} />
      </Link>

      <div className="navbar-links">
        {links.map(({ to, label }) => (
          <Link key={to} to={to} className={`nav-link ${location.pathname === to ? 'active' : ''}`}>
            {label}
          </Link>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        {user && (
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontSize:11, color: roleColor[user.role] || 'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px' }}>{user.role}</div>
            </div>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--navy-3)', border:`2px solid ${roleColor[user.role] || 'var(--border-2)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, overflow:'hidden' }}>
              {user.profile_photo_url
                ? <img src={user.profile_photo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : user.name?.[0]?.toUpperCase() || '?'}
            </div>
          </div>
        )}
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>Sign Out</button>
      </div>
    </nav>
  )
}
