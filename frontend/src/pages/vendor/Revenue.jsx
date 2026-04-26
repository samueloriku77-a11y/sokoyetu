import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import toast from 'react-hot-toast'

export default function VendorRevenue() {
  const { user, refreshUser } = useAuth()
  const [balance, setBalance] = useState(user?.wallet_balance || 0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', phone: user?.phone || '' })
  const [processing, setProcessing] = useState(false)
  const [stats, setStats] = useState({ total_orders: 0, orders_today: 0, avg_order_value: 0 })

  useEffect(() => {
    loadRevenue()
  }, [])

  const loadRevenue = async () => {
    try {
      const { data } = await api.get('/wallet')
      setBalance(data.wallet_balance)
      setTransactions(data.transactions || [])
      
      // Calculate stats from transactions
      const deposits = data.transactions.filter(t => t.transaction_type === 'DEPOSIT')
      if (deposits.length > 0) {
        setStats({
          total_orders: deposits.length,
          orders_today: deposits.filter(t => {
            const txDate = new Date(t.created_at).toDateString()
            return txDate === new Date().toDateString()
          }).length,
          avg_order_value: (deposits.reduce((sum, t) => sum + t.amount, 0) / deposits.length).toFixed(0)
        })
      }
    } catch (err) {
      toast.error('Failed to load revenue')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()
    if (!withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    if (parseFloat(withdrawForm.amount) > balance) {
      toast.error('Insufficient balance')
      return
    }
    if (!withdrawForm.phone) {
      toast.error('Enter your M-Pesa phone number')
      return
    }

    setProcessing(true)
    try {
      const { data } = await api.post('/wallet/withdraw', {
        amount: parseFloat(withdrawForm.amount),
        transaction_type: 'WITHDRAWAL',
        phone_number: withdrawForm.phone.replace(/^0/, '254'),
      })
      toast.success('Withdrawal initiated! Funds will arrive in 5 minutes.')
      setWithdrawForm({ amount: '', phone: withdrawForm.phone })
      loadRevenue()
      refreshUser()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Withdrawal failed')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px' }}>
      {/* Revenue Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {/* Total Revenue */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.1) 0%, rgba(34,197,94,.1) 100%)', border: '2px solid var(--border-2)' }}>
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>Total Revenue</p>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--green)', margin: '8px 0' }}>
              KES {balance.toLocaleString()}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Available to withdraw</p>
          </div>
        </div>

        {/* Orders Today */}
        <div className="card" style={{ background: 'rgba(233,69,96,.05)', border: '1px solid var(--border-2)' }}>
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>Orders Today</p>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)', margin: '8px 0' }}>
              {stats.orders_today}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Confirmed deliveries</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="card" style={{ background: 'rgba(251,146,60,.05)', border: '1px solid var(--border-2)' }}>
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>Total Orders</p>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'rgba(251,146,60,1)', margin: '8px 0' }}>
              {stats.total_orders}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>All time</p>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="card" style={{ background: 'rgba(168,85,247,.05)', border: '1px solid var(--border-2)' }}>
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>Avg Order Value</p>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'rgba(168,85,247,1)', margin: '8px 0' }}>
              KES {stats.avg_order_value}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Per order</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Withdraw Form - Left */}
        <div className="card" style={{ background: 'var(--navy-2)', border: '1px solid var(--border-2)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Withdraw to M-Pesa</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>Transfer your revenue directly to your account</p>

          <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label>Amount (KES)</label>
              <input
                type="number"
                placeholder={`Max: ${balance.toLocaleString()}`}
                value={withdrawForm.amount}
                onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                max={balance}
                required
              />
            </div>
            <div className="form-group">
              <label>M-Pesa Phone Number</label>
              <input
                type="tel"
                placeholder="0712345678"
                value={withdrawForm.phone}
                onChange={e => setWithdrawForm({ ...withdrawForm, phone: e.target.value })}
                required
              />
            </div>

            <button className="btn btn-primary btn-full" type="submit" disabled={processing || balance <= 0}>
              {processing ? 'Processing...' : 'Withdraw Now'}
            </button>
          </form>

          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.6, padding: '12px', background: 'rgba(251,146,60,.05)', borderRadius: 'var(--r-md)', borderLeft: '2px solid rgba(251,146,60,.3)' }}>
            💡 Withdrawals are processed instantly. Funds arrive in your M-Pesa account within 5 minutes.
          </p>
        </div>

        {/* Quick Stats - Right */}
        <div className="card" style={{ background: 'var(--navy-2)', border: '1px solid var(--border-2)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Performance Snapshot</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '12px', background: 'rgba(34,197,94,.05)', borderRadius: 'var(--r-md)', borderLeft: '3px solid var(--green)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Ready to Withdraw</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)', margin: 0 }}>
                KES {balance.toLocaleString()}
              </p>
            </div>

            <div style={{ padding: '12px', background: 'rgba(59,130,246,.05)', borderRadius: 'var(--r-md)', borderLeft: '3px solid #3b82f6' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Pending Confirmations</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6', margin: 0 }}>
                {transactions.filter(t => t.status === 'PENDING').length}
              </p>
            </div>

            <div style={{ padding: '12px', background: 'rgba(233,69,96,.05)', borderRadius: 'var(--r-md)', borderLeft: '3px solid var(--accent)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Withdrawn</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', margin: 0 }}>
                KES {transactions.filter(t => t.transaction_type === 'WITHDRAWAL').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue History */}
      <div className="card" style={{ background: 'var(--navy-2)', border: '1px solid var(--border-2)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Revenue History</h2>

        {transactions.filter(t => t.transaction_type === 'DEPOSIT').length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p>No revenue yet. Complete orders to earn!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-2)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 0', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '12px 0', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Source</th>
                  <th style={{ textAlign: 'center', padding: '12px 0', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '12px 0', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.filter(t => t.transaction_type === 'DEPOSIT').map((tx, idx) => (
                  <tr key={tx.id} style={{ borderBottom: idx < transactions.length - 1 ? '1px solid var(--border-2)' : 'none' }}>
                    <td style={{ padding: '12px 0', fontSize: 13 }}>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 0', fontSize: 13 }}>
                      Order Delivery
                    </td>
                    <td style={{ padding: '12px 0', textAlign: 'center' }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: tx.status === 'COMPLETED' ? 'rgba(34,197,94,.15)' : 'rgba(251,146,60,.15)',
                        color: tx.status === 'COMPLETED' ? 'var(--green)' : 'rgba(251,146,60,1)',
                      }}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>
                      + KES {tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
