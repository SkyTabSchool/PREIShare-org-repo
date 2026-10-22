// Layout route for everything under /dashboard.
// beforeLoad calls the server session helper. The helper uses the service-role
// client, so it is reached through a server function and not imported by the browser.
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { AppShell } from '../../components/dashboard/AppShell'
import { getUser, signOut } from '../../lib/auth/session'

const readSessionUser = createServerFn({ method: 'GET' }).handler(async () => {
  return getUser()
})

const signOutSession = createServerFn({ method: 'POST' }).handler(async () => {
  await signOut()
})

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const user = await readSessionUser()
    if (!user) {
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
      await signOutSession()
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
