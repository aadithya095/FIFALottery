/**
 * One-time admin seeding script.
 * Run: node scripts/seed-admins.js
 *
 * Reads credentials from environment variables so nothing is hardcoded.
 * Required env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   ADMIN_USERNAME, ADMIN_PASSWORD
 *   SUPER_ADMIN_USERNAME, SUPER_ADMIN_PASSWORD
 *
 * Example:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   ADMIN_USERNAME=matchday_admin ADMIN_PASSWORD=S3cureP@ss1 \
 *   SUPER_ADMIN_USERNAME=host_boss SUPER_ADMIN_PASSWORD=S3cureP@ss2 \
 *   node scripts/seed-admins.js
 */

import bcrypt from 'bcryptjs'

const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'SUPER_ADMIN_USERNAME',
  'SUPER_ADMIN_PASSWORD',
]

function validateEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key])
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '))
    process.exit(1)
  }
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12)
}

async function upsertAdmin({ username, password_hash, role }) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/admins`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({ username, password_hash, role }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Supabase error for ${username}: ${text}`)
  }

  const rows = await response.json()
  return Array.isArray(rows) ? rows[0] : rows
}

async function seedAdmins() {
  validateEnv()

  const accounts = [
    { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD, role: 'admin' },
    { username: process.env.SUPER_ADMIN_USERNAME, password: process.env.SUPER_ADMIN_PASSWORD, role: 'super_admin' },
  ]

  for (const account of accounts) {
    const password_hash = await hashPassword(account.password)

    const row = await upsertAdmin({ username: account.username, password_hash, role: account.role })

    if (!row) {
      console.error(`Failed to seed ${account.role} (${account.username}): no row returned`)
      process.exit(1)
    }

    console.log(`Seeded [${row.role}]: ${row.username} (id: ${row.id})`)
  }

  console.log('\nAdmin seeding complete. Store credentials securely and never commit them.')
}

seedAdmins()
