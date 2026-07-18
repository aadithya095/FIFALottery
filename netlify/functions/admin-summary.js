import { getDb } from './utils/db.js'
import { verifyAdminToken } from './utils/auth.js'
import { ok, unauthorized, serverError, preflight, badRequest } from './utils/response.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight()
  if (event.httpMethod !== 'GET') return badRequest('Method not allowed')

  const admin = verifyAdminToken(event)
  if (!admin) return unauthorized()

  const db = getDb()

  const [totalResult, assignedResult, availableResult] = await Promise.all([
    db.from('players').select('id', { count: 'exact', head: true }),
    db.from('players').select('id', { count: 'exact', head: true }).eq('status', 'assigned'),
    db.from('players').select('id', { count: 'exact', head: true }).eq('status', 'available'),
  ])

  if (totalResult.error || assignedResult.error || availableResult.error) {
    console.error('admin-summary error:', totalResult.error || assignedResult.error || availableResult.error)
    return serverError('Failed to fetch summary')
  }

  return ok({
    total: totalResult.count,
    assigned: assignedResult.count,
    available: availableResult.count,
  })
}
