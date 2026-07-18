import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

export default function AdminLoginPage() {
  const { admin, login } = useAdminAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (admin) return <Navigate to="/admin/dashboard" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Both fields are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      await login(form.username, form.password)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-wc-dark flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-wc-card border border-wc-border rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">🔐</div>
          <h1 className="font-display text-3xl text-gradient-gold tracking-widest">ADMIN LOGIN</h1>
          <p className="text-white/30 text-xs mt-1">WC2026 Lottery Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-white/50 text-xs mb-1 block">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-wc-dark border border-wc-border rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-wc-gold focus:outline-none transition-colors"
              placeholder="admin_username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs mb-1 block">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-wc-dark border border-wc-border rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-wc-gold focus:outline-none transition-colors"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <motion.p
              className="text-red-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-wc-gold to-yellow-500 text-wc-dark font-bold text-lg disabled:opacity-40 hover:brightness-110 transition-all mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
