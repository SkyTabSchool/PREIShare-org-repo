// List page under the protected /dashboard layout.
// Loads the signed-in sponsor's rows through listMyListings.
import {
  createFileRoute,
  Link,
  useRouter,
  type ErrorComponentProps,
} from '@tanstack/react-router'
import { ListingCard } from '../../../components/listings/ListingCard'
import { listMyListings } from '../../../server/listings'

export const Route = createFileRoute('/dashboard/listings/')({
  loader: () => listMyListings(),
  pendingComponent: ListingsPending,
  errorComponent: ListingsError,
  component: ListingsIndexPage,
})

function ListingsIndexPage() {
  const result = Route.useLoaderData()

  if (!result.ok) {
    return (
      <section aria-labelledby="listings-heading" className="flex flex-col gap-4">
        <h1 id="listings-heading" className="text-2xl font-semibold tracking-tight text-slate-900">
          Your property listings
        </h1>
        <p className="m-0 text-sm text-[#9f3030]" role="alert">
          {result.error}
        </p>
      </section>
    )
  }

  if (result.listings.length === 0) {
    return (
      <section aria-labelledby="listings-heading" className="flex flex-col gap-4">
        <h1 id="listings-heading" className="text-2xl font-semibold tracking-tight text-slate-900">
          Your property listings
        </h1>
        <p className="m-0 text-sm text-slate-600">
          No properties yet. Add your first listing to get started.
        </p>
        <Link to="/dashboard/listings/new" className="demo-button w-fit no-underline">
          Add listing
        </Link>
      </section>
    )
  }

  return (
    <section aria-labelledby="listings-heading" className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 id="listings-heading" className="text-2xl font-semibold tracking-tight text-slate-900">
          Your property listings
        </h1>
        <Link to="/dashboard/listings/new" className="demo-button no-underline">
          Add listing
        </Link>
      </header>
      <ul className="m-0 grid list-none gap-3 p-0">
        {result.listings.map((listing) => (
          <li key={listing.id}>
            <ListingCard listing={listing} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function ListingsPending() {
  return (
    <section aria-labelledby="listings-heading" aria-busy="true">
      <h1 id="listings-heading" className="text-2xl font-semibold tracking-tight text-slate-900">
        Your property listings
      </h1>
      <p className="mt-3 text-sm text-slate-600">Loading your listings…</p>
    </section>
  )
}

function ListingsError({ error, reset }: ErrorComponentProps) {
  const router = useRouter()

  return (
    <section aria-labelledby="listings-heading" className="flex flex-col gap-4">
      <h1 id="listings-heading" className="text-2xl font-semibold tracking-tight text-slate-900">
        Your property listings
      </h1>
      <p className="m-0 text-sm text-[#9f3030]" role="alert">
        {error.message}
      </p>
      <button
        type="button"
        className="demo-button w-fit"
        onClick={() => {
          reset()
          void router.invalidate()
        }}
      >
        Try again
      </button>
    </section>
  )
}
