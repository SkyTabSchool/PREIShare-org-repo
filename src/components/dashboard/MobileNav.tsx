// Small-screen nav for the investor shell. Same destinations as Sidebar.
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { dashboardNavItems, type DashboardNavPath } from '../layout/navConfig'

type MobileNavItem = {
  label: string
  to: DashboardNavPath
}

const defaultNavItems: MobileNavItem[] = dashboardNavItems.map((item) => ({
  label: item.label,
  to: item.path,
}))

export type MobileNavProps = {
  /** Same { label, to } list as Sidebar. */
  items?: MobileNavItem[]
}

export function MobileNav({ items = defaultNavItems }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="px-4 py-2 md:hidden">
      <button
        type="button"
        className="inline-flex min-h-11 items-center rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
        aria-expanded={open}
        aria-controls="mobile-dashboard-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Close menu' : 'Open menu'}
      </button>
      {open ? (
        <nav
          id="mobile-dashboard-menu"
          aria-label="Dashboard"
          className="mt-2 rounded border border-slate-200 bg-white p-3"
        >
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === '/dashboard' }}
                  className="block rounded px-3 py-2 text-sm text-slate-800 hover:bg-slate-100 data-[status=active]:bg-slate-100 data-[status=active]:font-medium"
                  activeProps={{ 'aria-current': 'page' }}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  )
}
