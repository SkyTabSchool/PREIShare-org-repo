import type { ReactNode } from 'react'

export type MetricCardProps = {
  /** Short label shown above the value, e.g. "Total equity" */
  label: string
  /** Main figure investors should see first. Pass an already-formatted string. */
  value: string
  /** Optional secondary line, e.g. "+2.4% this month" */
  hint?: string
  /** Optional icon or badge slot */
  icon?: ReactNode
}

/**
 * One glanceable investor metric. Presentational only — no data fetching.
 * When the figure is not live, pass a placeholder value such as "—" and a
 * hint like "Placeholder — not a live figure."
 */
export function MetricCard({ label, value, hint, icon }: MetricCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon ? <span aria-hidden="true">{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-sm text-slate-600">{hint}</p> : null}
    </article>
  )
}
