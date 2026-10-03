import { useEffect, useState, type ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

type AppShellProps = {
  title?: string
  children: ReactNode
}

/**
 * Shared investor chrome: sidebar + header + main content region.
 * Child routes render inside `children` (wired from the dashboard layout route).
 */
export function AppShell({ title, children }: AppShellProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const [navOpen, setNavOpen] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsNarrow(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!navOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navOpen])

  return (
    <div className="dash-shell app-shell {navOpen ? ' nav-open'}">
      <Sidebar id="investor-sidebar" collapsed={isNarrow && !navOpen} />
      <div className="dash-main app-shell-main-column">
        <Header
          {...(title !== undefined ? { title } : {})}
          navOpen={navOpen}
          onMenuToggle={() => setNavOpen((open) => !open)}
        />
        <main className="dash-content app-shell-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
