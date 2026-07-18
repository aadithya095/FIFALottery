import { useEffect, useRef } from 'react'

const COLORS = ['#C9A84C', '#74ACDF', '#AA151B', '#F1BF00', '#FFFFFF', '#5A9AC8']
const PIECE_COUNT = 120

export default function Confetti() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const pieces = Array.from({ length: PIECE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: Math.random() * 10 + 6,
      h: Math.random() * 6 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: Math.random() * 3 + 2,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      drift: (Math.random() - 0.5) * 1.5,
    }))

    let animId

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let allGone = true

      pieces.forEach((p) => {
        p.y += p.speed
        p.x += p.drift
        p.angle += p.spin

        if (p.y < canvas.height + 20) allGone = false

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height)
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })

      if (!allGone) {
        animId = requestAnimationFrame(draw)
      }
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
    />
  )
}
