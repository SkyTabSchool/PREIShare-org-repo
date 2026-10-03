export type HoldingSnapshot = {
  id: string
  name: string
  allocationLabel: string
  valueLabel: string
}

export type PortfolioSummaryProps = {
  title?: string
  totalLabel: string
  holdings?: HoldingSnapshot[]
  isSampleData?: boolean
}

/** Sample allocation mix. Not live balances, and not the full holdings table. */
const DEFAULT_MOCK_HOLDINGS: HoldingSnapshot[] = [
  {
    id: 'multifamily',
    name: 'Multifamily',
    allocationLabel: '45%',
    valueLabel: '$1.89M',
  },
  {
    id: 'retail',
    name: 'Retail',
    allocationLabel: '25%',
    valueLabel: '$1.05M',
  },
  {
    id: 'industrial',
    name: 'Industrial',
    allocationLabel: '20%',
    valueLabel: '$840K',
  },
  {
    id: 'office',
    name: 'Office',
    allocationLabel: '10%',
    valueLabel: '$420K',
  },
]

export function PortfolioSummary({
  title = 'Portfolio summary',
  totalLabel,
  holdings = DEFAULT_MOCK_HOLDINGS,
  isSampleData = true,
}: PortfolioSummaryProps) {
  return (
    <section className="portfolio-summary" aria-labelledby="portfolio-summary-heading">
      <div className="portfolio-summary__header">
        <h2 id="portfolio-summary-heading">{title}</h2>
        {isSampleData ? (
          <p className="sample-data-banner" role="note">
            Sample data — placeholders only, not live balances
          </p>
        ) : null}
      </div>
      <p className="portfolio-summary__total">
        <span className="portfolio-summary__total-label">Allocated (sample)</span>
        <span className="portfolio-summary__total-value">{totalLabel}</span>
      </p>
      <ul className="portfolio-summary__list">
        {holdings.map((item) => (
          <li key={item.id} className="portfolio-summary__row">
            <span className="portfolio-summary__name">{item.name}</span>
            <span className="portfolio-summary__allocation">{item.allocationLabel}</span>
            <span className="portfolio-summary__value">{item.valueLabel}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
