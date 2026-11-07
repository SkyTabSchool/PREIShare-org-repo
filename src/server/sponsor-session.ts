// createServerFn wrappers — safe to import from routes/components.
// Server-only cookie/client helpers live in sponsor-session.server.ts so
// @tanstack/react-start/server is not kept alive outside RPC handlers.
import { createServerFn } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'
import {
  adoptSession,
  getUser,
  signOut,
  type AdoptSessionResult,
} from '../lib/auth/session.server'

export type SponsorSession = {
  user: {
    email: string | null
  }
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
