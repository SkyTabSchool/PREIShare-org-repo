import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardOverviewPage,
})

function DashboardOverviewPage() {
  return <h2>Dashboard overview</h2>
}
