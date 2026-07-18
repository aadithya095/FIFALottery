import bcrypt from 'bcryptjs'
import { getDb } from './utils/db.js'
import { verifyAdminToken } from './utils/auth.js'
import { validateAdminCredentials, sanitizeText } from './utils/validate.js'
import { ok, badRequest, unauthorized, forbidden, serverError, preflight } from './utils/response.js'

/**
 * POST /api/admin-manage-admins
 * Body: { action: 'create' | 'deactivate' | 'reactivate', username, password?, role?, target_id? }
 * super_admin only.
 *
 * POST /api/admin-manage-admins?action=void — void/reassign a ticket
 * Body: { ticket_id }
 */
export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight()
  if (event.httpMethod !== 'POST') return badRequest('Method not allowed')

  const admin = verifyAdminToken(event)
  if (!admin) return unauthorized()
  if (admin.role !== 'super_admin') return forbidden('Super admin access required')

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return badRequest('Invalid JSON body')
  }

  const { action } = body
  const db = getDb()

  if (action === 'create') {
    const validation = validateAdminCredentials(body.username, body.password)
    if (!validation.valid) return badRequest(validation.message)

    const roleInput = sanitizeText(body.role)
    if (!['admin', 'super_admin'].includes(roleInput)) {
      return badRequest('Role must be admin or super_admin')
    }

    const password_hash = await bcrypt.hash(validation.password, 12)

    const { data, error } = await db
      .from('admins')
      .insert({
        username: validation.username,
        password_hash,
        role: roleInput,
        created_by: admin.sub,
      })
      .select('id, username, role')
      .single()

    if (error) {
      if (error.code === '23505') return badRequest('Username already exists')
      console.error('create admin error:', error.message)
      return serverError('Failed to create admin')
    }

    await db.from('audit_log').insert({
      admin_id: admin.sub,
      action: 'admin_created',
      target_id: data.id,
      meta: { username: data.username, role: data.role },
    })

    return ok({ message: `Admin ${data.username} created`, admin: data })
  }

  if (action === 'deactivate' || action === 'reactivate') {
    const targetId = sanitizeText(body.target_id)
    if (!targetId) return badRequest('target_id is required')

    const isActive = action === 'reactivate'

    const { data, error } = await db
      .from('admins')
      .update({ is_active: isActive })
      .eq('id', targetId)
      .neq('id', admin.sub)
      .select('id, username')
      .single()

    if (error || !data) {
      return badRequest('Admin not found or you cannot modify your own account')
    }

    await db.from('audit_log').insert({
      admin_id: admin.sub,
      action: `admin_${action}d`,
      target_id: data.id,
      meta: { username: data.username },
    })

    return ok({ message: `Admin ${data.username} ${action}d` })
  }

  if (action === 'void_ticket') {
    const ticketId = sanitizeText(body.ticket_id)
    if (!ticketId) return badRequest('ticket_id is required')

    const { data, error } = await db
      .from('players')
      .update({
        status: 'available',
        otp_hash: null,
        customer_name: null,
        customer_phone: null,
        assigned_by_admin_id: null,
        assigned_at: null,
        voided_at: new Date().toISOString(),
        voided_by: admin.sub,
      })
      .eq('id', ticketId)
      .eq('status', 'assigned')
      .select('player_number')
      .single()

    if (error || !data) {
      return badRequest('Ticket not found or already available')
    }

    await db.from('audit_log').insert({
      admin_id: admin.sub,
      action: 'ticket_voided',
      target_id: ticketId,
      meta: { player_number: data.player_number },
    })

    return ok({ message: `Ticket for player #${data.player_number} voided and slot made available` })
  }

  return badRequest('Unknown action. Valid: create | deactivate | reactivate | void_ticket')
}
