import type { ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { getPageTitle } from './navConfig'

type HeaderProps = {
  title?: string
  children?: ReactNode
  navOpen?: boolean
  onMenuToggle?: () => void
}

/** Top bar: page title for the current area, plus an optional actions slot. */
export function Header({ title, children, navOpen = false, onMenuToggle }: HeaderProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const heading = title ?? getPageTitle(pathname)
  const menuLabel = navOpen ? 'Close navigation' : 'Open navigation'

  return (
    <header className="dash-header dashboard-header">
      {onMenuToggle ? (
        <button
          type="button"
          className="dash-menu-toggle"
          aria-label={menuLabel}
          aria-expanded={navOpen}
          aria-controls="investor-sidebar"
          onClick={onMenuToggle}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" width="16" height="16">
            {navOpen ? (
              <path
                fill="currentColor"
                d="M3.22 2.22 2.22 3.28 6.94 8l-4.72 4.72 1 1.06L8 9.06l4.72 4.72 1.06-1.06L9.06 8l4.72-4.72-1.06-1.06L8 6.94 3.22 2.22z"
              />
            ) : (
              <path fill="currentColor" d="M1 3h14v2H1V3zm0 4h14v2H1V7zm0 4h14v2H1v-2z" />
            )}
          </svg>
          {menuLabel}
        </button>
      ) : null}
      <h1 className="header-title">{heading}</h1>
      <div className="header-actions">{children}</div>
    </header>
  )
}
