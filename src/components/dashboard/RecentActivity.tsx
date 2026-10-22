export type ActivityItem = {
  id: string
  /** Already-formatted time label for display, e.g. "Mar 18 · 2:04 PM" */
  whenLabel: string
  description: string
  /** Optional activity type, e.g. "Distribution" or "Notice" */
  category?: string
}

export type RecentActivityProps = {
  title?: string
  items: ActivityItem[]
  /** Shown when `items` is empty. The list is skipped in that case. */
  emptyMessage?: string
}

/** MOCK PLACEHOLDER — replace with real activity feed later */
export const MOCK_RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: 'a1',
    whenLabel: 'Mar 18 · 2:04 PM',
    description: 'Distribution posted for Riverfront Multifamily',
    category: 'Distribution',
  },
  {
    id: 'a2',
    whenLabel: 'Mar 17 · 11:20 AM',
    description: 'Quarterly report available for Cedar Retail Plaza',
    category: 'Document',
  },
  {
    id: 'a3',
    whenLabel: 'Mar 15 · 9:00 AM',
    description: 'Capital call reminder — Harbor Industrial',
    category: 'Notice',
  },
]

/**
 * Recent investor activity list for the dashboard home.
 * Presentational only — pass items in; this component does not fetch.
 */
export function RecentActivity({
  title = 'Recent activity',
  items,
  emptyMessage = 'No recent activity yet.',
}: RecentActivityProps) {
  const isEmpty = items.length === 0

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="recent-activity-heading">
      <h2 id="recent-activity-heading" className="text-lg font-semibold text-slate-900">
        {title}
      </h2>
      {isEmpty ? (
        <p className="mt-3 text-sm text-slate-600">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="border-l-2 border-slate-200 pl-3">
              <p className="text-xs text-slate-500">{item.whenLabel}</p>
              <p className="text-sm font-medium text-slate-800">{item.description}</p>
              {item.category ? (
                <p className="text-xs text-slate-500">{item.category}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
