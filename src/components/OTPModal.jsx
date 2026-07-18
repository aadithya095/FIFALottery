import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { publicApi } from '../services/api.js'
import { saveRevealedTicket } from '../services/ticketStorage.js'

export default function OTPModal({ isOpen, onClose, onReveal }) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', ''])
      setError('')
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [isOpen])

  function handleDigitChange(index, value) {
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    if (value && index < 3) inputRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const otp = digits.join('')
    if (otp.length !== 4) {
      setError('Please enter all 4 digits')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await publicApi.revealTicket(otp)
      saveRevealedTicket(data.player_number)
      onReveal(data.player_number)
      onClose()
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
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
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 w-full max-w-[min(92vw,420px)] rounded-2xl p-[clamp(1.25rem,5vw,2rem)] shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15,15,42,0.98), rgba(26,16,64,0.98))',
              border: '1px solid rgba(201,168,76,0.35)',
              boxShadow: '0 0 0 1px rgba(0,48,135,0.3), 0 24px 60px rgba(0,0,0,0.85)',
            }}
            initial={{ scale: 0.85, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          >
            {/* FIFA header strip */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: 'linear-gradient(90deg, #003087 0%, #BF0D3E 50%, #003087 100%)' }}
            />

            <div className="text-center mb-6 pt-2">
              <motion.div
                className="text-4xl mb-2"
                animate={{ rotateY: [0, 15, -15, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >🔑</motion.div>
              <h2 className="font-display text-[clamp(1.6rem,7vw,2.25rem)] text-gradient-gold tracking-widest">
                ENTER YOUR OTP
              </h2>
              <p className="text-white/50 text-xs sm:text-sm mt-1">
                4-digit code shared by your lottery host
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex gap-[clamp(0.5rem,2vw,0.75rem)] justify-center mb-6">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="text-center font-bold bg-wc-dark border-2 border-wc-border rounded-xl text-white focus:border-wc-gold focus:outline-none focus:ring-2 focus:ring-wc-gold/30 transition-all"
                    style={{
                      width: 'clamp(3.2rem, 18vw, 4rem)',
                      height: 'clamp(3.8rem, 20vw, 4.5rem)',
                      fontSize: 'clamp(1.25rem, 6vw, 1.75rem)',
                    }}
                  />
                ))}
              </div>

              {error && (
                <motion.p
                  className="text-red-400 text-sm text-center mb-4"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading || digits.join('').length !== 4}
                className="w-full py-3 rounded-xl font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #B8860B, #FFD700, #C9A84C)',
                  color: '#07071A',
                  boxShadow: '0 0 20px rgba(255,215,0,0.35)',
                }}
              >
                {loading ? 'Verifying...' : 'Reveal My Number →'}
              </button>
            </form>

            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white/30 hover:text-white/70 transition-colors text-xl"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
