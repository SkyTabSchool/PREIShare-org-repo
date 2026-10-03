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

  return (
    <header className="dash-header dashboard-header">
      {onMenuToggle ? (
        <button
          type="button"
          className="dash-menu-toggle"
          aria-expanded={navOpen}
          aria-controls="investor-sidebar"
          onClick={onMenuToggle}
        >
          {navOpen ? 'Close navigation' : 'Open navigation'}
        </button>
      ) : null}
      <h1 className="header-title">{heading}</h1>
      <div className="header-actions">{children}</div>
    </header>
  )
}
