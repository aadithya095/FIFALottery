import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDb } from './utils/db.js'
import { checkRevealRateLimit, markRevealSuccess } from './utils/rateLimit.js'
import { validateOtp } from './utils/validate.js'
import { ok, badRequest, tooManyRequests, serverError, preflight } from './utils/response.js'

const JWT_SECRET = process.env.JWT_SECRET

/**
 * Signs a short-lived reveal token so the scratch-card can verify
 * the player_number wasn't tampered with client-side.
 * @param {number} playerNumber
 * @returns {string}
 */
function signRevealToken(playerNumber) {
  return jwt.sign({ player_number: playerNumber }, JWT_SECRET, { expiresIn: '5m' })
}

function getClientIp(event) {
  return (
    event.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
    event.headers?.['x-nf-client-connection-ip'] ||
    event.headers?.['client-ip'] ||
    'unknown'
  )
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight()
  if (event.httpMethod !== 'POST') return badRequest('Method not allowed')

  const ip = getClientIp(event)

  const { allowed, remainingAttempts } = await checkRevealRateLimit(ip)
  if (!allowed) {
    return tooManyRequests(
      `Too many failed attempts. Please wait 10 minutes before trying again.`
    )
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return badRequest('Invalid JSON body')
  }

  const otpValidation = validateOtp(body.otp)
  if (!otpValidation.valid) return badRequest(otpValidation.message)

  const db = getDb()

  const { data: assignedTickets, error } = await db
    .from('players')
    .select('id, player_number, otp_hash')
    .eq('status', 'assigned')

  if (error) {
    console.error('reveal fetch error:', error.message)
    return serverError('Failed to verify OTP')
  }

  let matchedTicket = null
  for (const ticket of assignedTickets ?? []) {
    if (!ticket.otp_hash) continue
    const match = await bcrypt.compare(otpValidation.value, ticket.otp_hash)
    if (match) {
      matchedTicket = ticket
      break
    }
  }

  if (!matchedTicket) {
    return badRequest(`Invalid OTP. ${remainingAttempts} attempt(s) remaining in this window.`)
  }

  await markRevealSuccess(ip)

  const revealToken = signRevealToken(matchedTicket.player_number)

  await db.from('audit_log').insert({
    admin_id: null,
    action: 'ticket_revealed',
    target_id: matchedTicket.id,
    meta: { player_number: matchedTicket.player_number, ip },
  })

  return ok({
    player_number: matchedTicket.player_number,
    reveal_token: revealToken,
  })
}
