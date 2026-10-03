import type { ReactNode } from 'react'
import { NavItems } from './NavItems'

type SidebarProps = {
  id?: string
  brandLabel?: string
  children?: ReactNode
  /** True on a narrow screen while the drawer is closed, so hidden links leave the tab order. */
  collapsed?: boolean
}

/** Left navigation chrome for the investor dashboard shell. */
export function Sidebar({
  id = 'investor-sidebar',
  brandLabel = 'PREIshare',
  children,
  collapsed = false,
}: SidebarProps) {
  return (
    <aside
      id={id}
      className="dash-sidebar dashboard-sidebar"
      aria-label="Investor navigation"
      inert={collapsed ? true : undefined}
      aria-hidden={collapsed ? true : undefined}
    >
      <div className="sidebar-brand">{brandLabel}</div>
      <div className="dash-nav">
        <NavItems />
      </div>
      {children}
    </aside>
  )
}
