import bcrypt from 'bcryptjs'
import { getDb } from './utils/db.js'
import { signAdminToken, buildTokenCookie, buildClearTokenCookie } from './utils/auth.js'
import { validateAdminCredentials } from './utils/validate.js'
import { ok, badRequest, unauthorized, serverError, preflight } from './utils/response.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight()

  if (event.httpMethod === 'DELETE') {
    return ok({ message: 'Logged out' }, { 'Set-Cookie': buildClearTokenCookie() })
  }

  if (event.httpMethod !== 'POST') {
    return badRequest('Method not allowed')
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return badRequest('Invalid JSON body')
  }

  const validation = validateAdminCredentials(body.username, body.password)
  if (!validation.valid) return badRequest(validation.message)

  const db = getDb()

  const { data: admin, error } = await db
    .from('admins')
    .select('id, username, role, password_hash, is_active')
    .eq('username', validation.username)
    .single()

  if (error || !admin) return unauthorized('Invalid credentials')
  if (!admin.is_active) return unauthorized('Account is deactivated')

  const passwordMatch = await bcrypt.compare(validation.password, admin.password_hash)
  if (!passwordMatch) return unauthorized('Invalid credentials')

  await db.from('audit_log').insert({
    admin_id: admin.id,
    action: 'admin_login',
    meta: { username: admin.username },
  })

  const token = signAdminToken({ id: admin.id, username: admin.username, role: admin.role })

  return ok(
    { username: admin.username, role: admin.role },
    { 'Set-Cookie': buildTokenCookie(token) }
  )
}
