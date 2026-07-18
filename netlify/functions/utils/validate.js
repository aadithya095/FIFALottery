/**
 * Strips HTML tags and trims whitespace from a string.
 * @param {string} input
 * @returns {string}
 */
export function sanitizeText(input) {
  return String(input ?? '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

/**
 * Validates a customer name: non-empty, max 100 chars, no special SQL chars.
 * @param {string} name
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateCustomerName(name) {
  const clean = sanitizeText(name)
  if (!clean) return { valid: false, message: 'Customer name is required' }
  if (clean.length > 100) return { valid: false, message: 'Name must be 100 characters or fewer' }
  return { valid: true, value: clean }
}

/**
 * Validates a phone number: digits, spaces, +, -, parens only; 7-15 chars.
 * @param {string} phone
 * @returns {{ valid: boolean, message?: string }}
 */
export function validatePhone(phone) {
  const clean = sanitizeText(phone)
  if (!clean) return { valid: false, message: 'Phone number is required' }
  const normalized = clean.replace(/[\s\-().]/g, '')
  if (!/^\+?\d{7,15}$/.test(normalized)) {
    return { valid: false, message: 'Invalid phone number format' }
  }
  return { valid: true, value: clean }
}

/**
 * Validates that an OTP is exactly 4 digits.
 * @param {string} otp
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateOtp(otp) {
  const clean = sanitizeText(otp)
  if (!/^\d{4}$/.test(clean)) {
    return { valid: false, message: 'OTP must be exactly 4 digits' }
  }
  return { valid: true, value: clean }
}

/**
 * Validates admin credentials: username alphanum+underscore, password min 8 chars.
 * @param {string} username
 * @param {string} password
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateAdminCredentials(username, password) {
  const u = sanitizeText(username)
  const p = sanitizeText(password)

  if (!u || !p) return { valid: false, message: 'Username and password are required' }
  if (!/^[a-zA-Z0-9_]{3,50}$/.test(u)) {
    return { valid: false, message: 'Username must be 3-50 alphanumeric characters or underscores' }
  }
  if (p.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' }
  }
  return { valid: true, username: u, password: p }
}
