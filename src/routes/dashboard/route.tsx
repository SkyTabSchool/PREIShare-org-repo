// Layout route for everything under /dashboard.
// Session check uses the browser Supabase client (anon key + sponsor session).
// ssr is off so beforeLoad runs in the browser, where that session is stored.
// Do not import src/lib/auth/session.ts or the service-role server client here.
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { AppShell } from '../../components/dashboard/AppShell'
import { createBrowserSupabaseClient } from '../../lib/supabase/client'

export const Route = createFileRoute('/dashboard')({
  ssr: false,
  beforeLoad: async () => {
    const supabase = createBrowserSupabaseClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  const navigate = Route.useNavigate()
  const [signOutError, setSignOutError] = useState<string | null>(null)

  async function handleSignOut() {
    setSignOutError(null)
    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.auth.signOut()
      if (error) {
        setSignOutError(error.message)
        return
      }
      await navigate({ to: '/auth/login' })
    } catch (caught) {
      setSignOutError(caught instanceof Error ? caught.message : 'Sign out failed.')
    }
  }

  return (
    <AppShell
      title="Overview"
      actions={
        <button type="button" className="demo-button" onClick={() => void handleSignOut()}>
          Sign out
        </button>
      }
    >
      {signOutError ? (
        <p className="mb-4 text-sm text-[#9f3030]" role="alert">
          {signOutError}
        </p>
      ) : null}
      <Outlet />
    </AppShell>
  )
}
