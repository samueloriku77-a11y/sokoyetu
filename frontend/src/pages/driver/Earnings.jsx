import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import toast from 'react-hot-toast'

export default function DriverEarnings() {
  const { user, refreshUser } = useAuth()
  const [balance, setBalance] = useState(user?.wallet_balance || 0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', phone: user?.phone || '' })
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadEarnings()
  }, [])

  const loadEarnings = async () => {
    try {
      const { data } = await api.get('/wallet')
      setBalance(data.wallet_balance)
      setTransactions(data.transactions || [])
    } catch (err) {
      toast.error('Failed to load earnings')
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
      toast.success('Withdrawal initiated! Check your M-Pesa.')
      setWithdrawForm({ amount: '', phone: withdrawForm.phone })
      loadEarnings()
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
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px' }}>
      {/* Earnings Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,.12) 0%, rgba(59,130,246,.1) 100%)', border: '2px solid var(--border-2)', marginBottom: 32 }}>
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px' }}>Your Balance</p>
          <h1 style={{ fontSize: 48, fontWeight: 800, color: 'var(--green)', margin: 0 }}>
            KES {balance.toLocaleString()}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
            {user?.deliveries_completed || 0} deliveries completed
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 24 }}
            onClick={() => document.getElementById('withdraw-form')?.scrollIntoView({ behavior: 'smooth' })}
            disabled={balance <= 0}
          >
            Withdraw Earnings
          </button>
        </div>
      </div>

      {/* Withdraw Form */}
      <div id="withdraw-form" className="card" style={{ background: 'var(--navy-2)', border: '1px solid var(--border-2)', marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Withdraw to M-Pesa</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>Transfer your earnings to your M-Pesa account</p>

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

          <button className="btn btn-primary btn-full" type="submit" disabled={processing}>
            {processing ? 'Processing...' : 'Withdraw Now'}
          </button>
        </form>

        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.6 }}>
          Withdrawals are processed within 5 minutes. Funds will arrive in your M-Pesa account.
        </p>
      </div>

      {/* Earnings History */}
      <div className="card" style={{ background: 'var(--navy-2)', border: '1px solid var(--border-2)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Earnings History</h2>

        {transactions.filter(t => t.transaction_type === 'DEPOSIT').length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            <p>No earnings yet. Complete deliveries to earn!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {transactions.filter(t => t.transaction_type === 'DEPOSIT').map(tx => (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(34,197,94,.05)',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid rgba(34,197,94,.1)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Order Delivery</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>
                    + KES {tx.amount.toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    color: tx.status === 'COMPLETED' ? 'var(--green)' : 'var(--text-muted)',
                  }}>
                    {tx.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
