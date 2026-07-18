import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import OTPModal from '../../components/OTPModal.jsx'
import ScratchCard from '../../components/ScratchCard.jsx'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.13 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

function ParticleBackground() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const dots = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.4 + 0.1,
      drift: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      dots.forEach((d) => {
        d.y -= d.speed
        d.x += d.drift
        if (d.y < -5) { d.y = canvas.height + 5; d.x = Math.random() * canvas.width }
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,168,76,${d.opacity})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
}

function SoccerBall() {
  return (
    <motion.div
      className="relative select-none"
      animate={{ rotate: 360 }}
      transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      style={{ fontSize: 90, filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.4))' }}
    >
      ⚽
    </motion.div>
  )
}

function TrophyBadge() {
  return (
    <motion.div
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-wc-gold/30 bg-wc-gold/10 backdrop-blur-sm"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, type: 'spring' }}
    >
      <span>🏆</span>
      <span className="text-wc-gold text-xs font-semibold tracking-widest uppercase">
        Friends Lottery 2026
      </span>
      <span>🏆</span>
    </motion.div>
  )
}

export default function HomePage() {
  const [otpModalOpen, setOtpModalOpen] = useState(false)
  const [revealedNumber, setRevealedNumber] = useState(null)
  const [scratchVisible, setScratchVisible] = useState(false)
  const scratchRef = useRef(null)

  function handleReveal(playerNumber) {
    setRevealedNumber(playerNumber)
    setScratchVisible(true)
    setTimeout(() => scratchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#07071A' }}>
      <ParticleBackground />

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute rounded-full blur-3xl"
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 600, height: 600, top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(0,48,135,0.35) 0%, transparent 70%)' }}
        />
        <motion.div
          className="absolute rounded-full blur-3xl"
          animate={{ x: [0, -30, 20, 0], y: [0, 20, -30, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ width: 500, height: 500, bottom: '-5%', right: '-5%', background: 'radial-gradient(circle, rgba(191,13,62,0.3) 0%, transparent 70%)' }}
        />
        <motion.div
          className="absolute rounded-full blur-3xl"
          animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          style={{ width: 400, height: 400, top: '40%', left: '40%', background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(201,168,76,0.15)', backdropFilter: 'blur(12px)', background: 'rgba(7,7,26,0.6)' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">⚽</span>
          <span className="font-display text-xl tracking-widest" style={{ background: 'linear-gradient(90deg,#FFD700,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            WC2026 LOTTERY
          </span>
        </div>
        <Link to="/my-tickets" className="text-sm text-white/50 hover:text-wc-gold transition-colors flex items-center gap-1">
          🎟️ My Tickets
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 min-h-[90vh]">
        <motion.div
          className="flex flex-col items-center gap-6 max-w-3xl"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp}>
            <TrophyBadge />
          </motion.div>

          {/* Flags + Soccer Ball */}
          <motion.div variants={fadeUp} className="flex items-center gap-6">
            <motion.div
              className="text-6xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >🇦🇷</motion.div>
            <SoccerBall />
            <motion.div
              className="text-6xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            >🇪🇸</motion.div>
          </motion.div>

          {/* Main headline */}
          <motion.div variants={fadeUp} className="space-y-1">
            <h1 className="font-display tracking-wider leading-none text-white"
              style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', textShadow: '0 0 60px rgba(201,168,76,0.2)' }}>
              FIFA WORLD CUP
            </h1>
            <h1
              className="font-display tracking-wider leading-none"
              style={{
                fontSize: 'clamp(3rem, 10vw, 7rem)',
                background: 'linear-gradient(135deg, #B8860B 0%, #FFD700 40%, #DAA520 70%, #C9A84C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.4))',
              }}
            >
              2026 FINAL
            </h1>
          </motion.div>

          <motion.p variants={fadeUp} className="text-white/50 text-base max-w-sm leading-relaxed">
            Argentina vs Spain &nbsp;·&nbsp; MetLife Stadium, NJ
            <br />
            <span className="text-white/25 text-sm">Private friends lottery — 25 outfield player slots</span>
          </motion.p>

          {/* CTA Button */}
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-3 mt-2">
            <motion.button
              onClick={() => setOtpModalOpen(true)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="relative px-12 py-4 rounded-2xl font-bold text-xl text-wc-dark overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #B8860B, #FFD700, #C9A84C)',
                boxShadow: '0 0 40px rgba(255,215,0,0.5), 0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              <motion.span
                className="absolute inset-0 opacity-40"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', backgroundSize: '200% 100%' }}
                animate={{ backgroundPosition: ['-200% center', '200% center'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <span className="relative z-10">⚽ Reveal Your Player</span>
            </motion.button>
            <Link to="/my-tickets" className="text-white/30 text-sm hover:text-wc-gold transition-colors">
              Already revealed? View My Tickets →
            </Link>
          </motion.div>

          {/* Slot counter pills */}
          <motion.div variants={fadeUp} className="flex gap-3 flex-wrap justify-center mt-2">
            {[
              { label: '25', sub: 'Total Slots', color: 'rgba(201,168,76,0.15)', border: 'rgba(201,168,76,0.3)' },
              { label: '3–28', sub: 'Number Range', color: 'rgba(0,48,135,0.2)', border: 'rgba(0,48,135,0.4)' },
              { label: '2', sub: 'Prizes for 1st & 2nd Goal', color: 'rgba(191,13,62,0.15)', border: 'rgba(191,13,62,0.3)' },
            ].map(({ label, sub, color, border }) => (
              <div key={sub} className="px-5 py-3 rounded-xl text-center"
                style={{ background: color, border: `1px solid ${border}`, backdropFilter: 'blur(8px)' }}>
                <p className="font-display text-2xl text-white">{label}</p>
                <p className="text-white/40 text-xs">{sub}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Scratch card (post-OTP) ── */}
      <AnimatePresence>
        {scratchVisible && revealedNumber !== null && (
          <motion.section
            ref={scratchRef}
            className="relative z-10 flex flex-col items-center py-16 px-6"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-center mb-10">
              <h2 className="font-display text-4xl tracking-widest text-white mb-1">
                SCRATCH YOUR CARD
              </h2>
              <p className="text-white/30 text-sm">Your player is hidden beneath the silver panel</p>
            </div>
            <ScratchCard playerNumber={revealedNumber} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── How It Works ── */}
      <section className="relative z-10 px-6 py-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-4xl text-center tracking-widest mb-2"
            style={{ background: 'linear-gradient(90deg,#FFD700,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            HOW IT WORKS
          </h2>
          <p className="text-center text-white/30 text-sm mb-12">Three simple steps to your lucky number</p>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { step: '01', emoji: '�', title: 'Pay Offline', desc: 'Pay your entry fee directly to the lottery host — no online payment ever.', color: '#003087' },
              { step: '02', emoji: '🔑', title: 'Get Your OTP', desc: 'Host shares a unique 4-digit code with you after receiving payment.', color: '#BF0D3E' },
              { step: '03', emoji: '🎉', title: 'Scratch & Reveal', desc: 'Enter your OTP, scratch the card, and watch your player number appear!', color: '#C9A84C' },
            ].map(({ step, emoji, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="rounded-2xl p-6 text-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(15,15,42,0.9), rgba(26,26,64,0.9))',
                  border: `1px solid ${color}40`,
                  boxShadow: `0 4px 30px ${color}20`,
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="absolute top-3 right-4 font-display text-5xl opacity-10 text-white">{step}</div>
                <div className="text-4xl mb-4">{emoji}</div>
                <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
                <div className="mt-4 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Match Banner ── */}
      <section className="relative z-10 mx-6 mb-16 rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #003087 0%, #1a1040 50%, #BF0D3E 100%)', border: '1px solid rgba(201,168,76,0.2)' }}>
        <div className="px-8 py-10 text-center">
          <p className="text-white/40 text-xs tracking-widest uppercase mb-2">The Match</p>
          <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
            <div className="text-center">
              <div className="text-5xl mb-2">🇦🇷</div>
              <p className="font-display text-2xl text-white tracking-widest">ARGENTINA</p>
            </div>
            <div className="text-center px-4">
              <p className="font-display text-4xl text-wc-gold tracking-widest">VS</p>
              <p className="text-white/30 text-xs mt-1">July 19, 2026</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-2">🇪🇸</div>
              <p className="font-display text-2xl text-white tracking-widest">SPAIN</p>
            </div>
          </div>
          <p className="text-white/30 text-sm mt-4">MetLife Stadium · East Rutherford, New Jersey</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-8 text-center px-6" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <p className="text-white/20 text-xs">WC2026 Friends Lottery · No payment collected online · For private use only</p>
        <p className="text-white/10 text-xs mt-1">Not affiliated with FIFA · Unofficial fan lottery</p>
      </footer>

      <OTPModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onReveal={handleReveal}
      />
    </div>
  )
}
