// Desktop / large-layout nav for the investor shell.
// Labels and paths: docs/dashboard-routing-plan.md (via navConfig).
import { Link } from '@tanstack/react-router'
import { dashboardNavItems, type DashboardNavPath } from '../layout/navConfig'

export type DashboardNavItem = {
  label: string
  to: DashboardNavPath
}

const defaultNavItems: DashboardNavItem[] = dashboardNavItems.map((item) => ({
  label: item.label,
  to: item.path,
}))

export type SidebarProps = {
  /** Defaults to Home, Portfolio, Deals, Profile from the routing plan. */
  items?: DashboardNavItem[]
}

export function Sidebar({ items = defaultNavItems }: SidebarProps) {
  return (
    <aside className="hidden shrink-0 md:flex md:w-56 md:flex-col md:border-r md:border-slate-200 md:bg-slate-50 p-4">
      <p className="mb-4 text-sm font-semibold text-slate-700">PREIshare</p>
      <nav aria-label="Dashboard">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                activeOptions={{ exact: item.to === '/dashboard' }}
                className="block rounded px-3 py-2 text-sm text-slate-800 hover:bg-slate-200 data-[status=active]:bg-slate-200 data-[status=active]:font-medium"
                activeProps={{ 'aria-current': 'page' }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
