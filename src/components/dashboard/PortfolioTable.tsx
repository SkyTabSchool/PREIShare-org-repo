export type PortfolioHolding = {
  id: string
  propertyName: string
  assetType: string
  investedAmount: number
  currentValue: number
  status: 'Performing' | 'Under review' | 'Exited'
}

const mockHoldings: PortfolioHolding[] = [
  {
    id: 'h1',
    propertyName: 'Riverfront Lofts',
    assetType: 'Multifamily',
    investedAmount: 50000,
    currentValue: 56200,
    status: 'Performing',
  },
  {
    id: 'h2',
    propertyName: 'Cedar Business Park',
    assetType: 'Industrial',
    investedAmount: 75000,
    currentValue: 74100,
    status: 'Under review',
  },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

type PortfolioTableProps = {
  holdings?: PortfolioHolding[]
  emptyMessage?: string
}

export function PortfolioTable({
  holdings = mockHoldings,
  emptyMessage = 'No holdings to show yet. New investments will appear here.',
}: PortfolioTableProps) {
  if (holdings.length === 0) {
    return (
      <section className="dashboard-panel" aria-label="Portfolio holdings">
        <h2>Your holdings</h2>
        <p className="empty-state">{emptyMessage}</p>
      </section>
    )
  }

  return (
    <section className="dashboard-panel" aria-label="Portfolio holdings">
      <h2>Your holdings</h2>
      <div className="table-wrap dash-table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Type</th>
              <th scope="col">Invested</th>
              <th scope="col">Current value</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((row) => (
              <tr key={row.id}>
                <td>{row.propertyName}</td>
                <td>{row.assetType}</td>
                <td>{formatCurrency(row.investedAmount)}</td>
                <td>{formatCurrency(row.currentValue)}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
