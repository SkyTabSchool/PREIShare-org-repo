export type ActivityItem = {
  id: string
  title: string
  detail: string
  dateLabel: string
}

export type RecentActivityProps = {
  title?: string
  items?: ActivityItem[]
  isSampleData?: boolean
}

/** Sample investor events. Not the open-deals catalog. */
const DEFAULT_MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: 'a1',
    title: 'Cedar Court published',
    detail: 'New multifamily listing to review',
    dateLabel: 'Sep 28, 2026',
  },
  {
    id: 'a2',
    title: 'Maple & 4th moved to under offer',
    detail: 'Retail holding status updated',
    dateLabel: 'Sep 14, 2026',
  },
  {
    id: 'a3',
    title: 'Harbor Warehouse value updated',
    detail: 'Industrial share refreshed in this snapshot',
    dateLabel: 'Aug 30, 2026',
  },
  {
    id: 'a4',
    title: 'Oak Street Shops marked sold',
    detail: 'Kept in history after close',
    dateLabel: 'Aug 12, 2026',
  },
]

export function RecentActivity({
  title = 'Recent activity',
  items = DEFAULT_MOCK_ACTIVITY,
  isSampleData = true,
}: RecentActivityProps) {
  return (
    <section className="recent-activity" aria-labelledby="recent-activity-heading">
      <div className="recent-activity__header">
        <h2 id="recent-activity-heading">{title}</h2>
        {isSampleData ? (
          <p className="sample-data-banner" role="note">
            Sample activity — not connected to a live feed
          </p>
        ) : null}
      </div>
      <ol className="recent-activity__list">
        {items.map((item) => (
          <li key={item.id} className="recent-activity__item">
            <div className="recent-activity__body">
              <p className="recent-activity__title">{item.title}</p>
              <p className="recent-activity__detail">{item.detail}</p>
            </div>
            <time className="recent-activity__date">{item.dateLabel}</time>
          </li>
        ))}
      </ol>
    </section>
  )
}
