// Server functions for sponsor sign-in.
// Session tokens live in httpOnly cookies (see lib/auth/session.ts). The anon
// request client is then seeded from those cookies so RLS still sees auth.uid().
import { createServerFn } from '@tanstack/react-start'
import { getCookie, setResponseHeader } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import {
  adoptSession,
  getUser,
  signOut,
  type AdoptSessionResult,
} from '../lib/auth/session'
import type { Database } from '../lib/supabase/types'

export type SponsorSession = {
  user: {
    email: string | null
  }
}

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

export const readSponsorSession = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SponsorSession | null> => {
    setResponseHeader('Cache-Control', 'no-store')
    const user = await getUser()
    if (!user) return null
    return { user: { email: user.email ?? null } }
  },
)

export const storeSponsorSession = createServerFn({ method: 'POST' })
  .validator((input: unknown): { accessToken: string; refreshToken: string } => {
    if (!isTokenPair(input)) {
      throw new Error('Sign-in failed. Check your email and password.')
    }
    return input
  })
  .handler(async ({ data }): Promise<AdoptSessionResult> => {
    setResponseHeader('Cache-Control', 'no-store')
    return adoptSession(data.accessToken, data.refreshToken)
  })

export const signOutSponsor = createServerFn({ method: 'POST' }).handler(async () => {
  setResponseHeader('Cache-Control', 'no-store')
  await signOut()
})

function isTokenPair(
  input: unknown,
): input is { accessToken: string; refreshToken: string } {
  if (!input || typeof input !== 'object') return false
  const tokens = input as { accessToken?: unknown; refreshToken?: unknown }
  return (
    typeof tokens.accessToken === 'string' &&
    tokens.accessToken.length > 0 &&
    typeof tokens.refreshToken === 'string' &&
    tokens.refreshToken.length > 0
  )
}
