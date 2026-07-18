import bcrypt from 'bcryptjs'
import { getDb } from './utils/db.js'
import { verifyAdminToken } from './utils/auth.js'
import { validateCustomerName, validatePhone } from './utils/validate.js'
import { created, badRequest, unauthorized, serverError, preflight } from './utils/response.js'

/**
 * Generates a cryptographically random 4-digit OTP string.
 * @returns {string} e.g. "0472"
 */
function generateOtp() {
  const num = Math.floor(Math.random() * 10000)
  return String(num).padStart(4, '0')
}

/**
 * Picks a random available player_number by shuffling available IDs
 * server-side. Never returns the lowest/sequential slot.
 */
async function pickRandomAvailableSlot(db) {
  const { data, error } = await db
    .from('players')
    .select('id, player_number')
    .eq('status', 'available')

  if (error) throw error
  if (!data || data.length === 0) return null

  const randomIndex = Math.floor(Math.random() * data.length)
  return data[randomIndex]
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight()
  if (event.httpMethod !== 'POST') return badRequest('Method not allowed')

  const admin = verifyAdminToken(event)
  if (!admin) return unauthorized()

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return badRequest('Invalid JSON body')
  }

  const nameValidation = validateCustomerName(body.customer_name)
  if (!nameValidation.valid) return badRequest(nameValidation.message)

  const phoneValidation = validatePhone(body.customer_phone)
  if (!phoneValidation.valid) return badRequest(phoneValidation.message)

  const db = getDb()

  const slot = await pickRandomAvailableSlot(db)
  if (!slot) return badRequest('No available slots remaining')

  const plainOtp = generateOtp()
  const otp_hash = await bcrypt.hash(plainOtp, 12)

  const { error: updateError } = await db
    .from('players')
    .update({
      status: 'assigned',
      otp_hash,
      customer_name: nameValidation.value,
      customer_phone: phoneValidation.value,
      assigned_by_admin_id: admin.sub,
      assigned_at: new Date().toISOString(),
      voided_at: null,
      voided_by: null,
    })
    .eq('id', slot.id)
    .eq('status', 'available')

  if (updateError) {
    console.error('assign-ticket update error:', updateError.message)
    return serverError('Failed to assign ticket. Please try again.')
  }

  await db.from('audit_log').insert({
    admin_id: admin.sub,
    action: 'ticket_assigned',
    target_id: slot.id,
    meta: {
      player_number: slot.player_number,
      customer_name: nameValidation.value,
      customer_phone: phoneValidation.value,
    },
  })

  return created({
    player_number: slot.player_number,
    otp: plainOtp,
    customer_name: nameValidation.value,
    customer_phone: phoneValidation.value,
    message: 'Ticket assigned. Share the OTP with the customer — it will not be shown again.',
  })
}
