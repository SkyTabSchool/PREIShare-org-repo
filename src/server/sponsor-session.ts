// Server functions for sponsor sign-in. Uses the anon key plus request cookies.
// Do not call the service-role client from this module.
import { createServerFn } from '@tanstack/react-start'
import {
  deleteCookie,
  getCookie,
  setCookie,
  setResponseHeader,
} from '@tanstack/react-start/server'
import { createSupabaseServerClient } from '../lib/supabase.server'

export type SponsorSession = {
  user: {
    email: string | null
  }
}

type StartCookieOptions = NonNullable<Parameters<typeof setCookie>[2]>

function toStartCookieOptions(
  options?: Record<string, unknown>,
): StartCookieOptions | undefined {
  if (!options) return undefined

  const sameSite = options.sameSite
  const expires = options.expires
  const next: StartCookieOptions = {}

  if (typeof options.domain === 'string') next.domain = options.domain
  if (typeof options.path === 'string') next.path = options.path
  if (typeof options.maxAge === 'number') next.maxAge = options.maxAge
  if (expires instanceof Date) next.expires = expires
  if (typeof options.httpOnly === 'boolean') next.httpOnly = options.httpOnly
  if (typeof options.secure === 'boolean') next.secure = options.secure
  if (sameSite === 'lax' || sameSite === 'strict' || sameSite === 'none') {
    next.sameSite = sameSite
  }

  return next
}

/** Anon-key client for this request. Cookies carry the sponsor session so RLS applies. */
export function createRequestSupabase() {
  return createSupabaseServerClient({
    get(key) {
      const value = getCookie(key)
      return value === undefined ? undefined : { value }
    },
    set(key, value, options) {
      setCookie(key, value, toStartCookieOptions(options))
    },
    remove(key, options) {
      deleteCookie(key, toStartCookieOptions(options))
    },
  })
}

export const readSponsorSession = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SponsorSession | null> => {
    setResponseHeader('Cache-Control', 'no-store')
    const supabase = createRequestSupabase()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return null
    return { user: { email: data.user.email ?? null } }
  },
)

export const storeSponsorSession = createServerFn({ method: 'POST' })
  .validator((input: unknown): { accessToken: string; refreshToken: string } => {
    if (!isTokenPair(input)) {
      throw new Error('Sign-in failed. Check your email and password.')
    }
    return input
  })
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; error: string }> => {
    setResponseHeader('Cache-Control', 'no-store')
    const supabase = createRequestSupabase()
    const { error } = await supabase.auth.setSession({
      access_token: data.accessToken,
      refresh_token: data.refreshToken,
    })
    if (error) {
      return {
        ok: false,
        error: error.message || 'Sign-in failed. Check your email and password.',
      }
    }
    return { ok: true }
  })

export const signOutSponsor = createServerFn({ method: 'POST' }).handler(async () => {
  setResponseHeader('Cache-Control', 'no-store')
  const supabase = createRequestSupabase()
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(error.message || 'Sign out failed.')
  }
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
