import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from './Confetti.jsx'

const SCRATCH_THRESHOLD = 0.48
const ASPECT = 0.55

function drawSilverOverlay(ctx, w, h) {
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0,    '#8A8A8A')
  grad.addColorStop(0.12, '#D0D0D0')
  grad.addColorStop(0.28, '#F0F0F0')
  grad.addColorStop(0.42, '#C8C8C8')
  grad.addColorStop(0.58, '#EBEBEB')
  grad.addColorStop(0.74, '#B0B0B0')
  grad.addColorStop(1,    '#CECECE')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = 'rgba(255,255,255,0.09)'
  ctx.lineWidth = 1
  for (let x = -h; x < w + h; x += 9) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + h, h)
    ctx.stroke()
  }

  const shimmer = ctx.createLinearGradient(w * 0.2, 0, w * 0.8, h)
  shimmer.addColorStop(0,   'rgba(255,255,255,0)')
  shimmer.addColorStop(0.5, 'rgba(255,255,255,0.22)')
  shimmer.addColorStop(1,   'rgba(255,255,255,0)')
  ctx.fillStyle = shimmer
  ctx.fillRect(0, 0, w, h)

  const sparkles = [
    [0.12, 0.22], [0.72, 0.14], [0.86, 0.68], [0.22, 0.82],
    [0.5, 0.08], [0.9, 0.42], [0.08, 0.6], [0.62, 0.88],
  ]
  const sparkleRadius = Math.max(3, Math.min(w, h) * 0.025)
  sparkles.forEach(([sx, sy]) => {
    const px = sx * w
    const py = sy * h
    const r = ctx.createRadialGradient(px, py, 0, px, py, sparkleRadius)
    r.addColorStop(0, 'rgba(255,255,255,0.9)')
    r.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = r
    ctx.beginPath()
    ctx.arc(px, py, sparkleRadius, 0, Math.PI * 2)
    ctx.fill()
  })

  const fontSizeLabel = Math.max(12, w * 0.038)
  const fontSizeHint = Math.max(10, w * 0.028)
  ctx.fillStyle = '#555555'
  ctx.font = `bold ${fontSizeLabel}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('⚽  SCRATCH TO REVEAL  ⚽', w / 2, h / 2 - fontSizeLabel * 0.55)
  ctx.font = `${fontSizeHint}px Inter, sans-serif`
  ctx.fillStyle = '#777777'
  ctx.fillText('Drag your finger or mouse here', w / 2, h / 2 + fontSizeLabel * 0.85)
}

export default function ScratchCard({ playerNumber, onComplete }) {
  const wrapperRef = useRef(null)
  const canvasRef = useRef(null)
  const isDrawingRef = useRef(false)
  const isRevealedRef = useRef(false)
  const [size, setSize] = useState({ w: 320, h: 176 })
  const [isRevealed, setIsRevealed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [scratchPct, setScratchPct] = useState(0)

  const resizeCanvas = useCallback(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!wrapper || !canvas) return
    const rect = wrapper.getBoundingClientRect()
    const cssW = Math.min(rect.width, 420)
    const cssH = cssW * ASPECT
    setSize({ w: cssW, h: cssH })

    const dpr = window.devicePixelRatio || 1
    canvas.width = cssW * dpr
    canvas.height = cssH * dpr
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`

    const ctx = canvas.getContext('2d')
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(dpr, dpr)
    drawSilverOverlay(ctx, cssW, cssH)
  }, [])

  useEffect(() => {
    resizeCanvas()
    const ro = new ResizeObserver(() => resizeCanvas())
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    window.addEventListener('resize', resizeCanvas)
    return () => { ro.disconnect(); window.removeEventListener('resize', resizeCanvas) }
  }, [resizeCanvas])

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    const src = e.touches?.[0] ?? e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }

  function scratchAt(x, y) {
    const canvas = canvasRef.current
    if (!canvas || isRevealedRef.current) return
    const dpr = window.devicePixelRatio || 1
    const ctx = canvas.getContext('2d')
    const brush = Math.max(16, size.w * 0.085)

    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    const radGrad = ctx.createRadialGradient(
      x * dpr, y * dpr, 0,
      x * dpr, y * dpr, brush * dpr
    )
    radGrad.addColorStop(0,   'rgba(0,0,0,1)')
    radGrad.addColorStop(0.72, 'rgba(0,0,0,0.8)')
    radGrad.addColorStop(1,   'rgba(0,0,0,0)')
    ctx.fillStyle = radGrad
    ctx.beginPath()
    ctx.arc(x * dpr, y * dpr, brush * dpr, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let transparent = 0
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 20) transparent++
    }
    const pct = transparent / (canvas.width * canvas.height)
    setScratchPct(Math.round(pct * 100))
    if (pct >= SCRATCH_THRESHOLD) revealFully()
  }

  function revealFully() {
    if (isRevealedRef.current) return
    isRevealedRef.current = true
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    setIsRevealed(true)
    setShowConfetti(true)
    onComplete?.()
  }

  const numberSize = Math.max(64, size.w * 0.32)
  const headingSize = Math.max(28, size.w * 0.12)

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md px-4">
      {showConfetti && <Confetti />}

      <motion.div
        ref={wrapperRef}
        className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
        initial={{ rotateX: 8 }}
        animate={{ rotateX: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          perspective: 1000,
          background: 'linear-gradient(135deg, #0F0F2A 0%, #1A1040 50%, #0F0F2A 100%)',
          boxShadow: '0 0 0 2px rgba(201,168,76,0.45), 0 24px 70px rgba(0,0,0,0.85)',
        }}
      >
        {/* Header strip */}
        <div
          className="flex items-center justify-between px-[3%] py-2"
          style={{ background: 'linear-gradient(90deg, #003087, #BF0D3E)' }}
        >
          <span className="font-display text-[clamp(0.7rem,2.5vw,0.9rem)] text-white tracking-widest">FIFA WC 2026</span>
          <span className="text-white/70 text-[clamp(0.5rem,1.8vw,0.7rem)]">OFFICIAL LOTTERY</span>
          <span className="font-display text-[clamp(0.7rem,2.5vw,0.9rem)] text-white tracking-widest">FINAL</span>
        </div>

        {/* Prize reveal layer */}
        <div
          className="flex flex-col items-center justify-center gap-1 w-full relative z-0"
          style={{ height: size.h }}
        >
          <span className="text-white/30 text-[clamp(0.55rem,2vw,0.75rem)] tracking-widest uppercase">Your Player Number</span>
          <motion.span
            className="font-display leading-none text-gradient-gold"
            style={{
              fontSize: numberSize,
              filter: 'drop-shadow(0 0 14px rgba(255,215,0,0.55))',
            }}
            initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
            animate={isRevealed ? { scale: 1, opacity: 1, rotate: 0 } : {}}
            transition={{ type: 'spring', damping: 10, stiffness: 160, delay: 0.15 }}
          >
            #{playerNumber}
          </motion.span>
          <motion.div
            className="flex gap-2 items-center mt-1"
            initial={{ opacity: 0 }}
            animate={isRevealed ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
          >
            <span className="text-[clamp(1.2rem,4.5vw,1.8rem)]">🇦🇷</span>
            <span className="text-wc-gold font-display text-[clamp(0.65rem,2.2vw,0.85rem)] tracking-widest">vs</span>
            <span className="text-[clamp(1.2rem,4.5vw,1.8rem)]">🇪🇸</span>
          </motion.div>
        </div>

        {/* Scratch canvas overlay */}
        <canvas
          ref={canvasRef}
          className="absolute touch-none"
          style={{
            top: 34,
            left: 0,
            cursor: isRevealed ? 'default' : 'crosshair',
            pointerEvents: isRevealed ? 'none' : 'auto',
            transition: 'opacity 0.4s ease',
            opacity: isRevealed ? 0 : 1,
          }}
          onMouseDown={() => { isDrawingRef.current = true }}
          onMouseUp={() => { isDrawingRef.current = false }}
          onMouseLeave={() => { isDrawingRef.current = false }}
          onMouseMove={(e) => {
            if (!isDrawingRef.current) return
            const pos = getPos(e)
            scratchAt(pos.x, pos.y)
          }}
          onTouchStart={(e) => { e.preventDefault(); isDrawingRef.current = true }}
          onTouchEnd={(e) => { e.preventDefault(); isDrawingRef.current = false }}
          onTouchMove={(e) => {
            e.preventDefault()
            if (!isDrawingRef.current) return
            const pos = getPos(e)
            scratchAt(pos.x, pos.y)
          }}
        />

        {/* Progress bar */}
        {!isRevealed && scratchPct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-wc-gold transition-all"
              style={{ width: `${Math.min(scratchPct / SCRATCH_THRESHOLD / 100 * 100, 100)}%` }}
            />
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isRevealed && (
          <motion.div
            className="text-center px-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
          >
            <p
              className="font-display tracking-widest"
              style={{ fontSize: headingSize, color: '#FFD700' }}
            >
              🏆 YOUR LUCKY NUMBER! 🏆
            </p>
            <p className="text-white/40 text-[clamp(0.65rem,2.2vw,0.85rem)] mt-1">Saved to your device automatically</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!isRevealed && (
        <button
          onClick={revealFully}
          className="text-white/20 text-xs hover:text-white/40 transition-colors"
        >
          Skip scratch →
        </button>
      )}
    </div>
  )
}
