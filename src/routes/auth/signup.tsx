// Browser form. Uses the anon-key browser client only.
// On success with a session → /dashboard.
// If email confirmation is required (no session yet) → /auth/login.
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState, type SubmitEvent } from 'react'
import { createBrowserSupabaseClient } from '../../lib/supabase/client'
import { establishSession } from '../../server/auth'

export const Route = createFileRoute('/auth/signup')({
  component: SignupPage,
})

function SignupPage() {
  const navigate = Route.useNavigate()
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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      if (!data.session) {
        await navigate({ to: '/auth/login', search: { notice: 'confirm' } })
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
      setError(caught instanceof Error ? caught.message : 'Sign up failed.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="demo-page">
      <section className="demo-panel mx-auto max-w-md">
        <h1 className="demo-title text-3xl">Sign up</h1>
        <p className="demo-muted mt-2 mb-6 text-sm">
          Create a sponsor account with email and password.
        </p>
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
              autoComplete="new-password"
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
            {pending ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="demo-muted mt-4 mb-0 text-sm">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-[var(--sea-ink)]">
            Log in
          </Link>
        </p>
      </section>
    </main>
  )
}
