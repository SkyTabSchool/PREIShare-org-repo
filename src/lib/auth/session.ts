// SERVER-ONLY: never import this file from browser components or client routes.
// The service-role client has no browser session. Sponsor identity comes from
// httpOnly cookies set after sign-in, then checked with auth.getUser(jwt).
import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'
import { createServerSupabaseClient } from '../supabase/server'

const ACCESS_COOKIE = 'preishare_access_token'
const REFRESH_COOKIE = 'preishare_refresh_token'
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export type AdoptSessionResult = { ok: true } | { ok: false; error: string }

export async function getUser() {
  const accessToken = getCookie(ACCESS_COOKIE)
  const refreshToken = getCookie(REFRESH_COOKIE)
  if (!accessToken && !refreshToken) return null

  const supabase = createServerSupabaseClient()

  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken)
    if (!error && data.user) return data.user
  }

  if (!refreshToken) return null

  const refreshed = await supabase.auth.refreshSession({ refresh_token: refreshToken })
  const session = refreshed.data.session
  if (refreshed.error || !session) {
    clearAuthCookies()
    return null
  }

  writeAuthCookies(session.access_token, session.refresh_token)
  return session.user
}

/** Verify the browser sign-in, then store the tokens for later server reads. */
export async function adoptSession(
  accessToken: string,
  refreshToken: string,
): Promise<AdoptSessionResult> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.auth.getUser(accessToken)
  if (error || !data.user) {
    return { ok: false, error: 'Sign in could not be verified. Try again.' }
  }

  writeAuthCookies(accessToken, refreshToken)
  return { ok: true }
}

export async function signOut() {
  const accessToken = getCookie(ACCESS_COOKIE)
  clearAuthCookies()
  if (!accessToken) return

  try {
    const supabase = createServerSupabaseClient()
    await supabase.auth.admin.signOut(accessToken)
  } catch {
    // The cookies are already gone, so the dashboard guard treats this as signed out.
  }
}

function writeAuthCookies(accessToken: string, refreshToken: string) {
  const base = cookieOptions()
  setCookie(ACCESS_COOKIE, accessToken, {
    ...base,
    maxAge: Math.max(60, secondsUntilJwtExpiry(accessToken)),
  })
  setCookie(REFRESH_COOKIE, refreshToken, {
    ...base,
    maxAge: REFRESH_MAX_AGE_SECONDS,
  })
}

function clearAuthCookies() {
  const base = cookieOptions()
  deleteCookie(ACCESS_COOKIE, base)
  deleteCookie(REFRESH_COOKIE, base)
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
}

function secondsUntilJwtExpiry(token: string): number {
  const payload = token.split('.')[1]
  if (!payload) return 60 * 60
  try {
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      exp?: unknown
    }
    if (typeof json.exp !== 'number') return 60 * 60
    return json.exp - Math.floor(Date.now() / 1000)
  } catch {
    return 60 * 60
  }
}
