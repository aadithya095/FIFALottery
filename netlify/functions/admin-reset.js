import { getDb } from './utils/db.js'
import { verifyAdminToken } from './utils/auth.js'
import { ok, badRequest, unauthorized, forbidden, serverError, preflight } from './utils/response.js'

/**
 * POST /api/admin-reset
 * Resets all player slots to available and wipes audit/reveal-attempt history.
 * super_admin only.
 */
export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight()
  if (event.httpMethod !== 'POST') return badRequest('Method not allowed')

  const admin = verifyAdminToken(event)
  if (!admin) return unauthorized()
  if (admin.role !== 'super_admin') return forbidden('Super admin access required')

  const db = getDb()

  const { error: playerError } = await db
    .from('players')
    .update({
      status: 'available',
      otp_hash: null,
      customer_name: null,
      customer_phone: null,
      assigned_by_admin_id: null,
      assigned_at: null,
      voided_at: null,
      voided_by: null,
    })
    .in('status', ['assigned'])

  if (playerError) {
    console.error('reset players error:', playerError.message)
    return serverError('Failed to reset player slots')
  }

  const { error: auditError } = await db
    .from('audit_log')
    .delete()
    .neq('id', 0)

  if (auditError) {
    console.error('reset audit_log error:', auditError.message)
    return serverError('Failed to clear audit log')
  }

  const { error: attemptsError } = await db
    .from('reveal_attempts')
    .delete()
    .neq('id', 0)

  if (attemptsError) {
    console.error('reset reveal_attempts error:', attemptsError.message)
    return serverError('Failed to clear reveal attempts')
  }

  return ok({ message: 'Platform reset complete. All tickets are available and history is cleared.' })
}
