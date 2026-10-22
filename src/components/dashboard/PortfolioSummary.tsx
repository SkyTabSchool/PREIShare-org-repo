export type PortfolioHolding = {
  id: string
  name: string
  /** Display string already formatted for UI, e.g. "$120,000" or "18%" */
  allocationLabel: string
}

export type PortfolioSummaryProps = {
  title?: string
  holdings: PortfolioHolding[]
  /** Optional total line for the snapshot */
  totalLabel?: string
  /** Shown when `holdings` is empty. The list is skipped in that case. */
  emptyMessage?: string
}

/** MOCK PLACEHOLDER — replace with real portfolio data in a later sprint */
export const MOCK_PORTFOLIO_HOLDINGS: PortfolioHolding[] = [
  { id: 'h1', name: 'Riverfront Multifamily', allocationLabel: '42%' },
  { id: 'h2', name: 'Cedar Retail Plaza', allocationLabel: '33%' },
  { id: 'h3', name: 'Harbor Industrial', allocationLabel: '25%' },
]

/**
 * Short portfolio snapshot for the dashboard home.
 * Presentational only — pass holdings in; this component does not fetch.
 */
export function PortfolioSummary({
  title = 'Portfolio summary',
  holdings,
  totalLabel,
  emptyMessage = 'No portfolio data connected yet.',
}: PortfolioSummaryProps) {
  const isEmpty = holdings.length === 0

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="portfolio-summary-heading">
      <h2 id="portfolio-summary-heading" className="text-lg font-semibold text-slate-900">
        {title}
      </h2>
      {isEmpty ? (
        <p className="mt-3 text-sm text-slate-600">{emptyMessage}</p>
      ) : (
        <>
          {totalLabel ? (
            <p className="mt-1 text-sm text-slate-600">Total: {totalLabel}</p>
          ) : null}
          <ul className="mt-4 divide-y divide-slate-100">
            {holdings.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="font-medium text-slate-800">{item.name}</span>
                <span className="text-slate-600">{item.allocationLabel}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
