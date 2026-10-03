import { createFileRoute } from '@tanstack/react-router'
import { PortfolioSummary } from '../../components/dashboard/PortfolioSummary'
import { RecentActivity } from '../../components/dashboard/RecentActivity'
import { StatsCard } from '../../components/dashboard/StatsCard'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardOverviewPage,
})

function DashboardOverviewPage() {
  return (
    <div className="dashboard-home">
      <p className="sample-data-banner" role="note">
        Demo shell — all figures are placeholders
      </p>
      <div className="dash-card-grid dashboard-home__stats">
        <StatsCard
          label="Total portfolio value"
          value="$4.2M"
          hint="Mock total across this member's holdings"
        />
        <StatsCard label="Open deals" value="3" hint="Published or under offer" />
        <StatsCard label="Holdings" value="4" hint="Properties in this portfolio" />
      </div>
      <div className="dashboard-home__panels dash-card-grid">
        <PortfolioSummary totalLabel="100% of portfolio value" />
        <RecentActivity />
      </div>
    </div>
  )
}
