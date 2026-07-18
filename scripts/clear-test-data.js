import 'dotenv/config'
import { createInterface } from 'node:readline/promises'

function validateEnv() {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    console.error(`Missing env vars: ${missing.join(', ')}`)
    process.exit(1)
  }
}

async function clearData() {
  validateEnv()

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(
    'This will DELETE all test data: player assignments, audit log, and reveal attempts.\n' +
    'Admin accounts and the 25 slot rows will NOT be deleted.\n' +
    'Type "DELETE" to confirm: '
  )
  rl.close()

  if (answer.trim() !== 'DELETE') {
    console.log('Aborted. No data was changed.')
    process.exit(0)
  }

  const base = `${process.env.SUPABASE_URL}/rest/v1`
  const headers = {
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
  }

  const playerResp = await fetch(`${base}/players?status=in.(assigned,available)`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      status: 'available',
      otp_hash: null,
      customer_name: null,
      customer_phone: null,
      assigned_by_admin_id: null,
      assigned_at: null,
      voided_at: null,
      voided_by: null,
    }),
  })

  if (![200, 201, 204].includes(playerResp.status)) {
    const text = await playerResp.text()
    throw new Error(`Players update failed: ${text}`)
  }

  for (const table of ['audit_log', 'reveal_attempts']) {
    const resp = await fetch(`${base}/${table}?id=neq.0`, {
      method: 'DELETE',
      headers,
    })
    if (![200, 201, 204].includes(resp.status)) {
      const text = await resp.text()
      throw new Error(`Delete ${table} failed: ${text}`)
    }
  }

  console.log('Test data cleared. All player slots are now available.')
}

clearData().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
