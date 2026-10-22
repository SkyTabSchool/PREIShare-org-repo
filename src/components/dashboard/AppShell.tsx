import type { ReactNode } from 'react'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'

export type AppShellProps = {
  children: ReactNode
  /** Forwarded to Header */
  title?: string
  /** Optional replacement for the desktop sidebar region. */
  sidebar?: ReactNode
  /** Forwarded to Header (sign-out and other session actions). */
  actions?: ReactNode
}

/**
 * Shared frame for all /dashboard routes: header, nav, and main slot.
 * Sidebar shows from the md breakpoint up. MobileNav is the small-screen control.
 */
export function AppShell({ children, title, sidebar, actions }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header
        {...(title !== undefined ? { title } : {})}
        {...(actions !== undefined ? { actions } : {})}
      />
      <MobileNav />

      <div className="flex min-h-0 flex-1">
        {sidebar ?? <Sidebar />}

        <main className="min-w-0 flex-1 p-4 md:p-6" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
