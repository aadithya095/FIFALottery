import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminApi } from '../../services/api.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'
import { Navigate } from 'react-router-dom'

const EMPTY_FORM = { username: '', password: '', role: 'admin' }

export default function AdminManageAdmins() {
  const { admin } = useAdminAuth()

  if (admin?.role !== 'super_admin') return <Navigate to="/admin/dashboard" replace />

  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [actionId, setActionId] = useState(null)

  async function fetchAdmins() {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.listAdmins()
      setAdmins(data.admins)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAdmins() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      const result = await adminApi.createAdmin(form.username, form.password, form.role)
      setForm(EMPTY_FORM)
      alert(`Admin "${result.admin.username}" created successfully.`)
    } catch (err) {
      setFormError(err.message || 'Failed to create admin')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDeactivate(id, username) {
    if (!confirm(`Deactivate ${username}?`)) return
    setActionId(id)
    try {
      await adminApi.deactivateAdmin(id)
      await fetchAdmins()
    } catch (err) {
      alert(`Failed: ${err.message}`)
    } finally {
      setActionId(null)
    }
  }

  async function handleReactivate(id, username) {
    setActionId(id)
    try {
      await adminApi.reactivateAdmin(id)
      await fetchAdmins()
    } catch (err) {
      alert(`Failed: ${err.message}`)
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-gradient-gold tracking-widest mb-8">
        MANAGE ADMINS
      </h1>

      {/* Create new admin */}
      <section className="bg-wc-card border border-wc-border rounded-2xl p-6 mb-8">
        <h2 className="font-bold text-white mb-4">Create New Admin</h2>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-white/50 text-xs mb-1 block">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-wc-dark border border-wc-border rounded-xl px-4 py-3 text-white focus:border-wc-gold focus:outline-none transition-colors"
                placeholder="new_admin"
                required
              />
            </div>

            <div>
              <label className="text-white/50 text-xs mb-1 block">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-wc-dark border border-wc-border rounded-xl px-4 py-3 text-white focus:border-wc-gold focus:outline-none transition-colors"
                placeholder="Min 8 characters"
                minLength={8}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-white/50 text-xs mb-1 block">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-wc-dark border border-wc-border rounded-xl px-4 py-3 text-white focus:border-wc-gold focus:outline-none transition-colors"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {formError && (
            <motion.p
              className="text-red-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {formError}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={formLoading}
            className="self-start px-6 py-2.5 rounded-xl bg-gradient-to-r from-wc-gold to-yellow-500 text-wc-dark font-bold disabled:opacity-40 hover:brightness-110 transition-all"
          >
            {formLoading ? 'Creating...' : 'Create Admin'}
          </button>
        </form>
      </section>

      {/* Existing admins list */}
      <section className="bg-wc-card border border-wc-border rounded-2xl p-6">
        <h2 className="font-bold text-white mb-4">Existing Admins</h2>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-white/30 text-sm">Loading...</p>
        ) : admins.length === 0 ? (
          <p className="text-white/30 text-sm py-4 text-center">No admins found.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {admins.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-xl bg-wc-dark border border-wc-border"
              >
                <div>
                  <p className="text-white font-medium text-sm">{a.username}</p>
                  <p className="text-white/30 text-xs">{a.role.replace('_', ' ')}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      a.is_active
                        ? 'bg-green-900/40 text-green-400'
                        : 'bg-red-900/40 text-red-400'
                    }`}
                  >
                    {a.is_active ? 'Active' : 'Inactive'}
                  </span>

                  {a.is_active ? (
                    <button
                      onClick={() => handleDeactivate(a.id, a.username)}
                      disabled={actionId === a.id}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivate(a.id, a.username)}
                      disabled={actionId === a.id}
                      className="text-xs text-green-400 hover:text-green-300 disabled:opacity-40 transition-colors"
                    >
                      Reactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
