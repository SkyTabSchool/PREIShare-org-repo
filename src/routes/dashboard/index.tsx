// Default page at exactly /dashboard.
// Shell demo data only — replace with loaders/Supabase in a later sprint topic.
import { createFileRoute } from '@tanstack/react-router'
import { MetricCard } from '../../components/dashboard/MetricCard'
import {
  PortfolioSummary,
  type PortfolioHolding,
} from '../../components/dashboard/PortfolioSummary'
import {
  RecentActivity,
  type ActivityItem,
} from '../../components/dashboard/RecentActivity'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHomePage,
})

const demoMetrics = [
  { label: 'Portfolio value', value: '—', hint: 'Connect data to see live totals' },
  { label: 'Active investments', value: '—', hint: 'No investments loaded yet' },
  { label: 'Distributions (YTD)', value: '—', hint: 'Figures appear after sync' },
]

function DashboardHomePage() {
  const portfolioHoldings: PortfolioHolding[] = []
  const activityItems: ActivityItem[] = []

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Investor dashboard</h1>
        <p className="text-sm text-slate-600">
          Your PREIshare home base for portfolio metrics and recent activity.
          Figures below are placeholders until live data is connected.
        </p>
      </header>

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {demoMetrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
          />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PortfolioSummary
            holdings={portfolioHoldings}
            emptyMessage="No portfolio holdings to show yet. When your account is linked, summaries will appear here."
          />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity
            items={activityItems}
            emptyMessage="No recent activity yet. Distributions, documents, and updates will list here."
          />
        </div>
      </section>
    </div>
  )
}
