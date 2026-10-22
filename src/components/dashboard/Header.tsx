import type { ReactNode } from 'react'

export type HeaderProps = {
  /** Optional page or section label shown near the brand */
  title?: string
  /** Optional right-side actions (keep empty for now if unused) */
  actions?: ReactNode
}

/**
 * Top chrome for the PREIshare investor dashboard.
 * Shows branding + a demo user placeholder only — not real auth state.
 */
export function Header({ title = 'Dashboard', actions }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3"
      role="banner"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white">
          P
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">PREIshare</p>
          <p className="truncate text-xs text-slate-500">{title}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions}
        {/* Placeholder only — replace with real session UI in a later auth topic */}
        <div
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1"
          aria-label="Signed-in user placeholder"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-700">
            IN
          </span>
          <span className="hidden text-sm text-slate-700 sm:inline">Investor</span>
        </div>
      </div>
    </header>
  )
}
