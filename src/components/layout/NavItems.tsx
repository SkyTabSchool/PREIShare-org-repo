// Renders nav links from navConfig and marks the active route.

import { Link, useRouterState } from '@tanstack/react-router'
import { dashboardNavItems } from './navConfig'

export function NavItems() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <nav className="sidebar-nav" aria-label="Dashboard">
      <ul className="nav-list">
        {dashboardNavItems.map((item) => {
          const isActive =
            item.path === '/dashboard'
              ? pathname === '/dashboard' || pathname === '/dashboard/'
              : pathname === item.path || pathname.startsWith(`${item.path}/`)

          return (
            <li key={item.path}>
              <Link
                to={item.path}
                activeOptions={{ exact: item.path === '/dashboard' }}
                className={isActive ? 'nav-link nav-link-active' : 'nav-link'}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
