import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m'

/**
 * Signs a short-lived JWT for an admin session.
 * @param {{ id: string, username: string, role: string }} adminPayload
 * @returns {string} signed JWT
 */
export function signAdminToken(adminPayload) {
  return jwt.sign(
    { sub: adminPayload.id, username: adminPayload.username, role: adminPayload.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  )
}

/**
 * Verifies and decodes an admin JWT from the request cookie.
 * @param {object} event Netlify function event
 * @returns {{ sub: string, username: string, role: string } | null}
 */
export function verifyAdminToken(event) {
  const cookieHeader = event.headers?.cookie || ''
  const tokenMatch = cookieHeader.match(/admin_token=([^;]+)/)

  if (!tokenMatch) return null

  try {
    const decoded = jwt.verify(tokenMatch[1], JWT_SECRET)
    return decoded
  } catch {
    return null
  }
}

/**
 * Builds an httpOnly Set-Cookie header string for the admin token.
 * @param {string} token
 * @returns {string}
 */
export function buildTokenCookie(token) {
  const isProd = process.env.CONTEXT === 'production'
  return [
    `admin_token=${token}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Strict',
    isProd ? 'Secure' : '',
    'Max-Age=900',
  ]
    .filter(Boolean)
    .join('; ')
}

/**
 * Builds a cookie that clears the admin token.
 * @returns {string}
 */
export function buildClearTokenCookie() {
  return 'admin_token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0'
}
