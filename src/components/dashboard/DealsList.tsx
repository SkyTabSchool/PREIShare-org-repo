export type Deal = {
  id: string
  name: string
  location: string
  minimumInvestment: number
  status: 'Open' | 'Closing soon' | 'Waitlist'
}

const mockDeals: Deal[] = [
  {
    id: 'd1',
    name: 'Harbor View Residences',
    location: 'Tampa, FL',
    minimumInvestment: 25000,
    status: 'Open',
  },
  {
    id: 'd2',
    name: 'Summit Logistics Hub',
    location: 'Columbus, OH',
    minimumInvestment: 50000,
    status: 'Closing soon',
  },
]

type DealsListProps = {
  deals?: Deal[]
  emptyMessage?: string
}

export function DealsList({
  deals = mockDeals,
  emptyMessage = 'No open deals right now. Check back soon for new opportunities.',
}: DealsListProps) {
  if (deals.length === 0) {
    return (
      <section className="dashboard-panel" aria-label="Open deals">
        <h2>Open deals</h2>
        <p className="empty-state">{emptyMessage}</p>
      </section>
    )
  }

  return (
    <section className="dashboard-panel" aria-label="Open deals">
      <h2>Open deals</h2>
      <ul className="deals-list">
        {deals.map((deal) => (
          <li key={deal.id} className="deal-card">
            <div>
              <h3>{deal.name}</h3>
              <p>{deal.location}</p>
            </div>
            <p>Min. {formatCurrency(deal.minimumInvestment)}</p>
            <p className={`status status-${deal.status.replace(/\s+/g, '-').toLowerCase()}`}>
              {deal.status}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}
