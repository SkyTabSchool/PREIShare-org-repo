// Layout route for everything under /dashboard.
// Match import/export style to other files in src/routes.
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppShell } from '../../components/dashboard/AppShell'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <AppShell title="Overview">
      <Outlet />
    </AppShell>
  )
}
