import type { ReactNode } from 'react'
import { Header } from './Header'

export type AppShellProps = {
  children: ReactNode
  /** Forwarded to Header */
  title?: string
  /** Optional sidebar slot — Step 8 will pass the real Sidebar here */
  sidebar?: ReactNode
}

/**
 * Shared frame for all /dashboard routes: header, optional sidebar region, main slot.
 */
export function AppShell({ children, title, sidebar }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header {...(title !== undefined ? { title } : {})} />

      <div className="flex min-h-0 flex-1">
        {/* Reserved region for Sidebar (implemented in the next step) */}
        <aside
          className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:block"
          aria-label="Dashboard sidebar"
        >
          {sidebar ?? (
            <div className="p-4 text-sm text-slate-400">Navigation coming soon</div>
          )}
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-6" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
