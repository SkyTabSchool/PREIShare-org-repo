// Server-only helpers for sponsor cookie sessions + RLS-bound Supabase access.
// Import only from createServerFn handlers (or other *.server.ts modules).
import { getCookie } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '../lib/auth/session.server'
import type { Database } from '../lib/supabase/types'

const ACCESS_COOKIE = 'preishare_access_token'
const REFRESH_COOKIE = 'preishare_refresh_token'

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing server env ${name}. See docs/env-var-checklist.md.`)
  }
  return value
}

/**
 * Anon-key client for this request, authenticated as the cookie session user.
 * Prefer this over the service-role client for sponsor reads/writes so RLS applies.
 */
export async function createRequestSupabase() {
  // Refresh/validate first so the access cookie is usable for this request.
  await getUser()

  const url = requireEnv(
    'SUPABASE_URL',
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
  )
  const anonKey = requireEnv(
    'SUPABASE_ANON_KEY',
    process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY,
  )
  const accessToken = getCookie(ACCESS_COOKIE)
  const refreshToken = getCookie(REFRESH_COOKIE)

  const supabase = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  }

  return supabase
}
