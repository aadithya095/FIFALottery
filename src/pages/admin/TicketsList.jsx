import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminApi } from '../../services/api.js'
import { useAdminAuth } from '../../context/AdminAuthContext.jsx'

export default function AdminTicketsList() {
  const { admin } = useAdminAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [voidingId, setVoidingId] = useState(null)

  async function fetchTickets() {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.getTickets()
      setTickets(data.tickets)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTickets() }, [])

  async function handleVoid(ticketId, playerNumber) {
    if (!confirm(`Void slot #${playerNumber}? The customer will lose their assignment.`)) return
    setVoidingId(ticketId)
    try {
      await adminApi.voidTicket(ticketId)
      await fetchTickets()
    } catch (err) {
      alert(`Failed to void: ${err.message}`)
    } finally {
      setVoidingId(null)
    }
  }

  const assignedTickets = tickets.filter((t) => t.status === 'assigned')

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl text-gradient-gold tracking-widest mb-8">ALL TICKETS</h1>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-white/30 text-sm">Loading...</p>
      ) : (
        <>
          <p className="text-white/40 text-xs mb-4">
            {assignedTickets.length} / 25 slots assigned
          </p>

          <div className="overflow-x-auto rounded-2xl border border-wc-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-wc-card text-white/40 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Customer Name</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Assigned By</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  {admin?.role === 'super_admin' && (
                    <th className="px-4 py-3 text-left">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, i) => (
                  <motion.tr
                    key={ticket.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-t border-wc-border hover:bg-wc-card/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-wc-gold">#{ticket.player_number}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'assigned'
                            ? 'bg-argentina/20 text-argentina'
                            : 'bg-wc-border text-white/40'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">{ticket.customer_name ?? '—'}</td>
                    <td className="px-4 py-3 text-white/60">{ticket.customer_phone ?? '—'}</td>
                    <td className="px-4 py-3 text-white/40 text-xs">
                      {ticket.assigned_by_admin?.username ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs">
                      {ticket.assigned_at
                        ? new Date(ticket.assigned_at).toLocaleDateString()
                        : '—'}
                    </td>
                    {admin?.role === 'super_admin' && (
                      <td className="px-4 py-3">
                        {ticket.status === 'assigned' && !ticket.voided_at && (
                          <button
                            onClick={() => handleVoid(ticket.id, ticket.player_number)}
                            disabled={voidingId === ticket.id}
                            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors"
                          >
                            {voidingId === ticket.id ? 'Voiding...' : 'Void'}
                          </button>
                        )}
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
