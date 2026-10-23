// Server function the browser calls after a successful anon-key sign-in.
// The handler stores tokens in httpOnly cookies. It does not accept an owner id.
import { createServerFn } from '@tanstack/react-start'
import { adoptSession, type AdoptSessionResult } from '../lib/auth/session'

export const establishSession = createServerFn({ method: 'POST' })
  .validator((input: unknown): { accessToken: string; refreshToken: string } => {
    if (!isSessionTokens(input)) {
      throw new Error('Missing session tokens.')
    }
    return input
  })
  .handler(async ({ data }): Promise<AdoptSessionResult> => {
    return adoptSession(data.accessToken, data.refreshToken)
  })

function isSessionTokens(
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
