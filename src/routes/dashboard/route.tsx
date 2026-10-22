// Layout route for everything under /dashboard.
// Match import/export style to other files in src/routes.
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <p className="text-sm font-medium tracking-wide text-slate-500">
          PREIshare
        </p>
        <h1 className="text-lg font-semibold">Investor Dashboard</h1>
      </header>
      <main className="p-4">
        {/* Child routes (like index) render inside Outlet */}
        <Outlet />
      </main>
    </div>
  )
}
