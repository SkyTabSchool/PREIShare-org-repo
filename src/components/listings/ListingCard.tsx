// Presentational listing summary. Props in only — no env, no database client.
import type { ListingStatus } from '../../lib/listings/schema'

export type ListingCardProps = {
  listing: {
    id: string
    title: string
    address_line1: string
    city: string
    region: string | null
    price: number
    status: ListingStatus
  }
}

export function ListingCard({ listing }: ListingCardProps) {
  const place = listing.region ? `${listing.city}, ${listing.region}` : listing.city

  return (
    <article
      aria-label={listing.title}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">{listing.title}</h2>
      <p className="mt-1 text-sm text-slate-700">{listing.address_line1}</p>
      <p className="text-sm text-slate-700">{place}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{formatPrice(listing.price)}</p>
      <p className="mt-1 text-sm text-slate-600">Status: {listing.status}</p>
    </article>
  )
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}
