import type { ReactNode } from 'react'
import { NavItems } from './NavItems'

type SidebarProps = {
  brandLabel?: string
  children?: ReactNode
}

/** Left navigation chrome for the investor dashboard shell. */
export function Sidebar({ brandLabel = 'PREIshare', children }: SidebarProps) {
  return (
    <aside className="dashboard-sidebar" aria-label="Investor navigation">
      <div className="sidebar-brand">{brandLabel}</div>
      <NavItems />
      {children}
    </aside>
  )
}
