import { getDb } from './utils/db.js'
import { verifyAdminToken } from './utils/auth.js'
import { ok, unauthorized, forbidden, serverError, preflight, badRequest } from './utils/response.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight()
  if (event.httpMethod !== 'GET') return badRequest('Method not allowed')

  const admin = verifyAdminToken(event)
  if (!admin) return unauthorized()
  if (admin.role !== 'super_admin') return forbidden('Super admin access required')

  const db = getDb()

  const { data, error } = await db
    .from('admins')
    .select('id, username, role, is_active, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('admin-list error:', error.message)
    return serverError('Failed to fetch admins')
  }

  return ok({ admins: data })
}
