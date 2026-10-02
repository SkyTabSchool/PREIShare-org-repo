import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div data-area="dashboard-layout">
      <p>PREIshare investor dashboard layout</p>
      <Outlet />
    </div>
  )
}
