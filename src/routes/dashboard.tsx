// Layout for /dashboard. Anonymous visitors are redirected before the page renders.
import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { supabaseBrowser } from '../lib/supabase.client'
import { readSponsorSession, signOutSponsor } from '../server/sponsor-session'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await readSponsorSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
    return { session }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  const navigate = Route.useNavigate()
  const { session } = Route.useRouteContext()
  const [signOutError, setSignOutError] = useState<string | null>(null)

  async function handleSignOut() {
    setSignOutError(null)
    try {
      await signOutSponsor()
      await supabaseBrowser.auth.signOut({ scope: 'local' })
      await navigate({ to: '/login' })
    } catch (caught) {
      setSignOutError(caught instanceof Error ? caught.message : 'Sign out failed.')
    }
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <p className="text-sm text-gray-500">PREIshare sponsor dashboard</p>
          <p className="font-medium">{session.user.email ?? 'Signed-in sponsor'}</p>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm underline">
            Home
          </Link>
          <button type="button" onClick={() => void handleSignOut()} className="text-sm underline">
            Sign out
          </button>
        </nav>
      </header>
      <main className="p-6">
        {signOutError ? (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {signOutError}
          </p>
        ) : null}
        <Outlet />
      </main>
    </div>
  )
}
