import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import toast from 'react-hot-toast'

export default function Wallet() {
  const { user, refreshUser } = useAuth()
  const [balance, setBalance] = useState(user?.wallet_balance || 0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('balance')
  const [depositForm, setDepositForm] = useState({ amount: '', phone: user?.phone || '' })
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', phone: user?.phone || '' })
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadWallet()
  }, [])

  const loadWallet = async () => {
    try {
      const { data } = await api.get('/wallet')
      setBalance(data.wallet_balance)
      setTransactions(data.transactions || [])
    } catch (err) {
      toast.error('Failed to load wallet')
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async (e) => {
    e.preventDefault()
    if (!depositForm.amount || parseFloat(depositForm.amount) <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    if (!depositForm.phone) {
      toast.error('Enter your M-Pesa phone number')
      return
    }

    setProcessing(true)
    try {
      const { data } = await api.post('/wallet/deposit', {
        amount: parseFloat(depositForm.amount),
        transaction_type: 'DEPOSIT',
        phone_number: depositForm.phone.replace(/^0/, '254'),
      })
      toast.success('Deposit initiated! Check your M-Pesa.')
      setDepositForm({ amount: '', phone: depositForm.phone })
      setActiveTab('balance')
      loadWallet()
      refreshUser()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Deposit failed')
    } finally {
      setProcessing(false)
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
      toast.success('Withdrawal initiated! Funds coming to M-Pesa.')
      setWithdrawForm({ amount: '', phone: withdrawForm.phone })
      setActiveTab('balance')
      loadWallet()
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
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
      {/* Balance Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(74,222,128,.1) 0%, rgba(96,165,250,.1) 100%)', border: '2px solid var(--border-2)', marginBottom: 32 }}>
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px' }}>Current Balance</p>
          <h1 style={{ fontSize: 48, fontWeight: 800, color: 'var(--accent)', margin: 0 }}>
            KES {balance.toLocaleString()}
          </h1>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
            <button
              className="btn btn-primary"
              onClick={() => setActiveTab('deposit')}
            >
              + Deposit
            </button>
            <button
              className="btn btn-outline"
              onClick={() => setActiveTab('withdraw')}
              disabled={balance <= 0}
            >
              — Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Deposit Tab */}
      {activeTab === 'deposit' && (
        <div className="card" style={{ background: 'var(--navy-2)', border: '1px solid var(--border-2)', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Deposit Money</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>Add funds to your SokoYetu wallet using M-Pesa</p>

          <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label>Amount (KES)</label>
              <input
                type="number"
                placeholder="e.g., 500"
                value={depositForm.amount}
                onChange={e => setDepositForm({ ...depositForm, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>M-Pesa Phone Number</label>
              <input
                type="tel"
                placeholder="0712345678"
                value={depositForm.phone}
                onChange={e => setDepositForm({ ...depositForm, phone: e.target.value })}
                required
              />
            </div>

            <button className="btn btn-primary btn-full" type="submit" disabled={processing}>
              {processing ? 'Processing...' : 'Request M-Pesa STK'}
            </button>
          </form>

          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.6 }}>
            You'll receive an M-Pesa prompt on your phone. Enter your PIN to complete the deposit. Funds will appear in your wallet immediately.
          </p>
        </div>
      )}

      {/* Withdraw Tab */}
      {activeTab === 'withdraw' && (
        <div className="card" style={{ background: 'var(--navy-2)', border: '1px solid var(--border-2)', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Withdraw Money</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>Transfer your wallet balance to M-Pesa</p>

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
              {processing ? 'Processing...' : 'Withdraw to M-Pesa'}
            </button>
          </form>

          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.6 }}>
            Your withdrawal will be processed within 5 minutes. Funds will arrive in your M-Pesa account.
          </p>
        </div>
      )}

      {/* Transactions List */}
      {activeTab === 'balance' && (
        <div className="card" style={{ background: 'var(--navy-2)', border: '1px solid var(--border-2)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Recent Transactions</h2>

          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <p>No transactions yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,.02)',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid rgba(255,255,255,.05)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                      {tx.transaction_type === 'DEPOSIT' ? '+ Deposit' : '− Withdrawal'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: tx.transaction_type === 'DEPOSIT' ? 'var(--green)' : 'var(--accent)' }}>
                      {tx.transaction_type === 'DEPOSIT' ? '+' : '−'} KES {tx.amount.toLocaleString()}
                    </div>
                    <div style={{
                      fontSize: 11,
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      color: tx.status === 'COMPLETED' ? 'var(--green)' : tx.status === 'FAILED' ? '#ef4444' : 'var(--text-muted)',
                    }}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
