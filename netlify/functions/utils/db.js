import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

/**
 * Lazily creates a single Supabase client per function instance.
 * Uses the service-role key so all operations bypass RLS.
 */
let _client = null

export function getDb() {
  if (_client) return _client

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  }

  _client = createClient(url, key, {
    auth: { persistSession: false },
    realtime: { transport: ws },
  })

  return _client
}
