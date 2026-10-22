// SERVER-ONLY: never import this file from browser components or client routes.
// Reads server-only env from the checklist:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY (bypasses RLS — not for browser code)
// Sponsor listing reads/writes that must honor RLS should pass the user JWT
// into a session-scoped client later. Do not expose the service-role key.
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export function createServerSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. See docs/setup/supabase-env-checklist.md',
    )
  }

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
