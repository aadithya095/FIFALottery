import { getDb } from './db.js'

const WINDOW_MINUTES = 10
const MAX_ATTEMPTS = 5

/**
 * Checks whether the given IP has exceeded the reveal attempt limit.
 * Inserts a new attempt record.
 *
 * @param {string} ip
 * @returns {{ allowed: boolean, remainingAttempts: number }}
 */
export async function checkRevealRateLimit(ip) {
  const db = getDb()
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()

  const { count, error } = await db
    .from('reveal_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('attempted_at', windowStart)

  if (error) {
    console.error('rateLimit check error:', error.message)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
  }

  const currentCount = count ?? 0

  if (currentCount >= MAX_ATTEMPTS) {
    return { allowed: false, remainingAttempts: 0 }
  }

  await db.from('reveal_attempts').insert({ ip_address: ip })

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - currentCount - 1 }
}

/**
 * Marks the latest attempt for this IP as successful
 * (used after a correct OTP so we can filter success vs. failure).
 * @param {string} ip
 */
export async function markRevealSuccess(ip) {
  const db = getDb()
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()

  await db
    .from('reveal_attempts')
    .update({ success: true })
    .eq('ip_address', ip)
    .gte('attempted_at', windowStart)
    .order('attempted_at', { ascending: false })
    .limit(1)
}
