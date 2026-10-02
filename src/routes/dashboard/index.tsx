import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardOverviewPage,
})

function DashboardOverviewPage() {
  return (
    <main>
      <h1>Dashboard overview</h1>
    </main>
  )
}
