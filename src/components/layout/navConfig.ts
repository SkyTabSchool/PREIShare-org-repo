// Single source of truth for investor-facing nav labels, paths, and page titles.

export type DashboardNavPath =
  | '/dashboard'
  | '/dashboard/portfolio'
  | '/dashboard/deals'
  | '/dashboard/profile'

export type NavItemConfig = {
  label: string
  path: DashboardNavPath
  title: string
}

export const dashboardNavItems: NavItemConfig[] = [
  {
    label: 'Home',
    path: '/dashboard',
    title: 'Dashboard overview',
  },
  {
    label: 'Portfolio',
    path: '/dashboard/portfolio',
    title: 'Your portfolio',
  },
  {
    label: 'Deals',
    path: '/dashboard/deals',
    title: 'Open deals',
  },
  {
    label: 'Profile',
    path: '/dashboard/profile',
    title: 'Your profile',
  },
]

export function getPageTitle(pathname: string): string {
  const exact = dashboardNavItems.find((item) => item.path === pathname)
  if (exact) return exact.title

  // Prefer the most specific matching path (longest prefix) for nested routes later.
  const prefixMatch = [...dashboardNavItems]
    .sort((a, b) => b.path.length - a.path.length)
    .find(
      (item) =>
        item.path !== '/dashboard' && pathname.startsWith(`${item.path}/`),
    )

  return prefixMatch?.title ?? 'Dashboard'
}
