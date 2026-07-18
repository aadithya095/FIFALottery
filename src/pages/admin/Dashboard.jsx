import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminApi } from '../../services/api.js'
import AssignTicketModal from '../../components/AssignTicketModal.jsx'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

const TOTAL_SLOTS = 25
const ALL_NUMBERS = [3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28]

export default function AdminDashboard() {
  const { admin } = useAdminAuth()
  const [summary, setSummary] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [resetting, setResetting] = useState(false)

  async function fetchData() {
    setLoading(true)
    setError('')
    try {
      const [s, t] = await Promise.all([adminApi.getSummary(), adminApi.getTickets()])
      setSummary(s)
      setTickets(t.tickets)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  async function handleReset() {
    const confirmed = window.confirm(
      'WARNING: This will reset every player slot to available and wipe the audit log and reveal attempts.\n\nAdmin accounts will NOT be deleted.\n\nThis cannot be undone. Continue?'
    )
    if (!confirmed) return

    setResetting(true)
    setError('')
    try {
      await adminApi.resetPlatform()
      alert('Platform reset complete. All tickets are available and history is cleared.')
      await fetchData()
    } catch (err) {
      setError(err.message || 'Reset failed. Only super_admins can reset the platform.')
    } finally {
      setResetting(false)
    }
  }

  function getSlotStatus(number) {
    const ticket = tickets.find((t) => t.player_number === number)
    if (!ticket) return 'available'
    if (ticket.voided_at) return 'voided'
    return ticket.status
  }

  const slotColorMap = {
    available: 'bg-wc-dark border-wc-border text-white/40',
    assigned: 'bg-argentina/20 border-argentina text-argentina-dark font-bold',
    voided: 'bg-spain-red/20 border-spain-red text-red-400',
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <h1 className="font-display text-3xl text-gradient-gold tracking-widest">DASHBOARD</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setAssignModalOpen(true)}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-wc-gold to-yellow-500 text-wc-dark font-bold text-sm hover:brightness-110 transition-all"
          >
            + Assign Ticket
          </button>
          {admin?.role === 'super_admin' && (
            <button
              onClick={handleReset}
              disabled={resetting}
              className="px-4 py-2 rounded-xl border border-red-500/60 text-red-400 text-sm hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              {resetting ? 'Resetting...' : '🔄 Reset Platform'}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Slots', value: summary.total, color: 'text-white' },
            { label: 'Assigned', value: summary.assigned, color: 'text-argentina' },
            { label: 'Available', value: summary.available, color: 'text-wc-gold' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-wc-card border border-wc-border rounded-2xl p-5 text-center">
              <p className={`font-display text-4xl ${color}`}>{value}</p>
              <p className="text-white/40 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Slot grid */}
      <h2 className="text-white/40 text-xs uppercase tracking-widest mb-3">Slot Overview</h2>
      {loading ? (
        <p className="text-white/30 text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2">
          {ALL_NUMBERS.map((n) => {
            const status = getSlotStatus(n)
            return (
              <motion.div
                key={n}
                whileHover={{ scale: 1.08 }}
                className={`aspect-square flex items-center justify-center rounded-xl border text-sm cursor-default transition-colors ${slotColorMap[status]}`}
                title={status}
              >
                {n}
              </motion.div>
            )
          })}
        </div>
      )}

      <div className="flex gap-4 mt-4 text-xs text-white/30">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-argentina/20 border border-argentina inline-block" /> Assigned</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-wc-dark border border-wc-border inline-block" /> Available</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-spain-red/20 border border-spain-red inline-block" /> Voided</span>
      </div>

      <AssignTicketModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssigned={() => {
          setAssignModalOpen(false)
          fetchData()
        }}
      />
    </div>
  )
}
