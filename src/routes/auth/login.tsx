// Browser form. Uses the anon-key browser client only.
// On success → /dashboard. On failure → show the error text.
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState, type SubmitEvent } from 'react'
import { createBrowserSupabaseClient } from '../../lib/supabase/client'
import { establishSession } from '../../server/auth'

type LoginSearch = {
  notice?: 'confirm'
}

export const Route = createFileRoute('/auth/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    if (search.notice === 'confirm') return { notice: 'confirm' }
    return {}
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = Route.useNavigate()
  const { notice } = Route.useSearch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      const supabase = createBrowserSupabaseClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) {
        setError(signInError.message)
        return
      }
      if (!data.session) {
        setError('Sign in did not return a session. Confirm your email, then try again.')
        return
      }
      const established = await establishSession({
        data: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        },
      })
      if (!established.ok) {
        setError(established.error)
        return
      }
      await navigate({ to: '/dashboard' })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Sign in failed.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="demo-page">
      <section className="demo-panel mx-auto max-w-md">
        <h1 className="demo-title text-3xl">Log in</h1>
        <p className="demo-muted mt-2 mb-6 text-sm">
          Sponsors sign in with email and password.
        </p>
        {notice === 'confirm' ? (
          <p className="demo-muted mb-4 text-sm" role="status">
            Check your email to confirm the account, then log in.
          </p>
        ) : null}
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1 text-sm font-semibold text-[var(--sea-ink)]">
            Email
            <input
              className="demo-input font-normal"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-[var(--sea-ink)]">
            Password
            <input
              className="demo-input font-normal"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? (
            <p className="m-0 text-sm text-[#9f3030]" role="alert">
              {error}
            </p>
          ) : null}
          <button className="demo-button" type="submit" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="demo-muted mt-4 mb-0 text-sm">
          No account yet?{' '}
          <Link to="/auth/signup" className="font-semibold text-[var(--sea-ink)]">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  )
}
