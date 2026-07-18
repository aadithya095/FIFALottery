import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '../services/api.js'

export default function AssignTicketModal({ isOpen, onClose, onAssigned }) {
  const [form, setForm] = useState({ customer_name: '', customer_phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [assigned, setAssigned] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setForm({ customer_name: '', customer_phone: '' })
    setError('')
    setAssigned(null)
    setCopied(false)
  }, [isOpen])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await adminApi.assignTicket(form.customer_name, form.customer_phone)
      setAssigned(result)
    } catch (err) {
      setError(err.message || 'Failed to assign ticket')
    } finally {
      setLoading(false)
    }
  }

  async function copyOtp() {
    if (!assigned?.otp) return
    try {
      await navigator.clipboard.writeText(String(assigned.otp))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
      setError('Copy failed. Manually select and copy the OTP.')
    }
  }

  function handleSuccessClose() {
    onAssigned()
  }

  function handleCancel() {
    setForm({ customer_name: '', customer_phone: '' })
    setError('')
    setCopied(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={assigned ? undefined : handleCancel}
          />

          <motion.div
            className="relative z-10 w-full max-w-[min(92vw,420px)] rounded-2xl p-[clamp(1.25rem,5vw,2rem)] shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15,15,42,0.98), rgba(26,16,64,0.98))',
              border: '1px solid rgba(201,168,76,0.35)',
              boxShadow: '0 0 0 1px rgba(0,48,135,0.3), 0 24px 60px rgba(0,0,0,0.85)',
            }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
          >
            {/* FIFA header strip */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: 'linear-gradient(90deg, #003087 0%, #BF0D3E 50%, #003087 100%)' }}
            />

            {!assigned ? (
              <>
                <h2 className="font-display text-2xl text-gradient-gold mb-6 pt-2 tracking-widest">
                  ASSIGN TICKET
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">Customer Name</label>
                    <input
                      type="text"
                      value={form.customer_name}
                      onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                      className="w-full bg-wc-dark border border-wc-border rounded-xl px-4 py-3 text-white focus:border-wc-gold focus:outline-none transition-colors"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-white/50 text-xs mb-1 block">Phone Number</label>
                    <input
                      type="tel"
                      value={form.customer_phone}
                      onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                      className="w-full bg-wc-dark border border-wc-border rounded-xl px-4 py-3 text-white focus:border-wc-gold focus:outline-none transition-colors"
                      placeholder="+1 555 0100"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                  )}

                  <p className="text-white/30 text-xs">
                    A random slot and OTP will be assigned. The OTP is shown once — copy it to share with the customer.
                  </p>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 py-3 rounded-xl border border-wc-border text-white/60 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-wc-gold to-yellow-500 text-wc-dark font-bold disabled:opacity-40 hover:brightness-110 transition-all"
                    >
                      {loading ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                </form>

                <button
                  onClick={handleCancel}
                  className="absolute top-3 right-3 text-white/30 hover:text-white/60 transition-colors"
                >
                  ✕
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center pt-3 text-center">
                <motion.div
                  className="text-5xl mb-3"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                >🎟️</motion.div>

                <h3 className="font-display text-2xl text-gradient-gold tracking-widest mb-1">
                  TICKET ASSIGNED
                </h3>
                <p className="text-white/40 text-xs mb-6">
                  Share these details with the customer. The OTP will not be shown again.
                </p>

                <div className="w-full space-y-4">
                  <div className="bg-wc-dark/60 border border-wc-border rounded-xl p-4">
                    <p className="text-white/40 text-xs uppercase tracking-widest">Player Number</p>
                    <p className="font-display text-4xl text-wc-gold">#{assigned.player_number}</p>
                  </div>

                  <div className="bg-wc-dark/60 border border-wc-border rounded-xl p-4 text-left">
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Customer</p>
                    <p className="text-white font-medium">{assigned.customer_name}</p>
                    <p className="text-white/60 text-sm">{assigned.customer_phone}</p>
                  </div>

                  <div className="bg-wc-dark/60 border border-wc-border rounded-xl p-4">
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-2">OTP</p>
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="font-display text-3xl tracking-[0.3em] text-white"
                        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                      >
                        {assigned.otp}
                      </span>
                      <button
                        type="button"
                        onClick={copyOtp}
                        className="px-3 py-2 rounded-lg bg-wc-gold/10 border border-wc-gold/40 text-wc-gold text-sm hover:bg-wc-gold/20 transition-colors"
                      >
                        {copied ? 'Copied!' : 'Copy OTP'}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-red-400/80 text-xs mt-4 mb-2">
                  ⚠️ Once you close this, the OTP cannot be revealed again.
                </p>

                <button
                  type="button"
                  onClick={handleSuccessClose}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-wc-gold to-yellow-500 text-wc-dark font-bold hover:brightness-110 transition-all"
                >
                  I’ve Copied the OTP — Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
