import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getStoredTickets } from '../../services/ticketStorage.js'

export default function MyTickets() {
  const tickets = getStoredTickets()

  return (
    <div className="min-h-screen bg-wc-dark">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-wc-border">
        <Link to="/" className="font-display text-2xl text-gradient-gold tracking-widest">
          WC2026 LOTTERY
        </Link>
        <Link to="/" className="text-sm text-white/60 hover:text-wc-gold transition-colors">
          ← Back to Home
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-5xl text-gradient-gold tracking-widest mb-2">
            MY TICKETS
          </h1>
          <p className="text-white/40 text-sm">Revealed tickets saved on this device</p>
        </motion.div>

        {tickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🎟️</div>
            <p className="text-white/30 text-lg">No tickets revealed yet</p>
            <Link
              to="/"
              className="inline-block mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-wc-gold to-yellow-500 text-wc-dark font-bold hover:brightness-110 transition-all"
            >
              Reveal a Ticket
            </Link>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {tickets.map(({ playerNumber, revealedAt }, index) => (
              <motion.div
                key={playerNumber}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.08 }}
                className="bg-wc-card border border-wc-border rounded-2xl p-6 flex flex-col items-center gap-2 animate-pulse-glow"
              >
                <span className="text-white/30 text-xs tracking-widest uppercase">Player Number</span>
                <span className="font-display text-7xl text-gradient-gold">#{playerNumber}</span>
                <div className="flex gap-2 mt-2 text-sm">
                  <span title="Argentina" className="text-xl">🇦🇷</span>
                  <span className="text-white/30">vs</span>
                  <span title="Spain" className="text-xl">🇪🇸</span>
                </div>
                <span className="text-white/20 text-xs mt-1">
                  Revealed {new Date(revealedAt).toLocaleDateString()}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
