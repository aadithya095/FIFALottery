import { getDb } from './utils/db.js'
import { verifyAdminToken } from './utils/auth.js'
import { ok, unauthorized, serverError, preflight, badRequest } from './utils/response.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight()
  if (event.httpMethod !== 'GET') return badRequest('Method not allowed')

  const admin = verifyAdminToken(event)
  if (!admin) return unauthorized()

  const db = getDb()

  const { data, error } = await db
    .from('players')
    .select(`
      id,
      player_number,
      status,
      customer_name,
      customer_phone,
      assigned_at,
      voided_at,
      assigned_by_admin:admins!assigned_by_admin_id ( username, role )
    `)
    .order('player_number', { ascending: true })

  if (error) {
    console.error('admin-tickets fetch error:', error.message)
    return serverError('Failed to fetch tickets')
  }

  return ok({ tickets: data })
}
