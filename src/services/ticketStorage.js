const STORAGE_KEY = 'wc2026_revealed_tickets'

/**
 * @typedef {{ playerNumber: number, revealedAt: string }} RevealedTicket
 */

/**
 * Returns all tickets previously revealed on this device.
 * @returns {RevealedTicket[]}
 */
export function getStoredTickets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Saves a newly revealed ticket to localStorage (deduplicates by playerNumber).
 * @param {number} playerNumber
 */
export function saveRevealedTicket(playerNumber) {
  const existing = getStoredTickets()
  const alreadyStored = existing.some((t) => t.playerNumber === playerNumber)
  if (alreadyStored) return

  const updated = [
    ...existing,
    { playerNumber, revealedAt: new Date().toISOString() },
  ]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

/**
 * Checks whether a given playerNumber has already been revealed on this device.
 * @param {number} playerNumber
 * @returns {boolean}
 */
export function isTicketRevealed(playerNumber) {
  return getStoredTickets().some((t) => t.playerNumber === playerNumber)
}
