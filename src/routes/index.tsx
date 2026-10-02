import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main>
      <h1>PREIshare</h1>
      <p>Investor dashboard shell — starter home route.</p>
      <p>
        <Link to="/dashboard" className="demo-button no-underline">
          Open the investor dashboard
        </Link>
      </p>
    </main>
  )
}
