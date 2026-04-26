import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      if (user.role === 'CUSTOMER') navigate('/customer')
      else if (user.role === 'VENDOR') navigate('/vendor')
      else if (user.role === 'DRIVER') navigate('/driver')
      else if (user.role === 'ADMIN') navigate('/admin')
      else navigate('/') // Fallback
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed. Check credentials.')
    }
  }

  return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background: 'radial-gradient(ellipse at 30% 50%, rgba(233,69,96,.08) 0%, transparent 60%), var(--navy)' }}>
      <div style={{ width:'100%', maxWidth:420, padding:'0 24px' }}>

        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <Link to="/">
            <img src="/logo.jpeg" alt="SokoYetu Logo" style={{ height: "64px", width: "auto", marginBottom: 6 }} />
          </Link>
          <p style={{ color:'var(--text-secondary)', fontSize:14 }}>Hyperlocal · Community · Delivery</p>
        </div>

        <div className="card" style={{ background:'var(--navy-2)', border:'1px solid var(--border-2)' }}>
          <h2 style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>Sign In</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:28 }}>Access your dashboard</p>

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} required />
            </div>

            <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop:8 }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign:'center', fontSize:13, color:'var(--text-muted)' }}>
            No account?{' '}
            <Link to="/register" style={{ color:'var(--accent)', fontWeight:600 }}>Create one</Link>
          </p>
        </div>


      </div>
    </div>
  )
}
