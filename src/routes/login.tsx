// Sponsor sign-in. The form uses the public anon client only.
// Tokens are then stored in httpOnly cookies via storeSponsorSession.
import { createFileRoute } from '@tanstack/react-router'
import { useState, type SubmitEvent } from 'react'
import { supabaseBrowser } from '../lib/supabase.browser'
import { storeSponsorSession } from '../server/sponsor-session'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = Route.useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const { data, error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMessage(error.message || 'Sign-in failed. Check your email and password.')
        return
      }

      if (!data.session) {
        setErrorMessage('Sign-in failed. Confirm your email, then try again.')
        return
      }

      const stored = await storeSponsorSession({
        data: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        },
      })

      if (!stored.ok) {
        setErrorMessage(stored.error)
        return
      }

      // Do not call supabaseBrowser.auth.signOut here. Even scope: 'local' hits
      // /logout and revokes the session, so the httpOnly cookies become useless.
      await navigate({ to: '/dashboard' })
    } catch (caught) {
      setErrorMessage(
        caught instanceof Error
          ? caught.message
          : 'Sign-in failed. Check your email and password.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Sponsor sign in</h1>
      <p className="mt-2 text-sm text-gray-600">
        Sign in to manage PREIshare properties you are allowed to see.
      </p>
      <form method="post" onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>
        {errorMessage ? (
          <p role="alert" className="text-sm text-red-600">
            {errorMessage}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
