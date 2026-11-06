// Sponsor property list under the protected /dashboard layout.
// Rows are loaded with the session-aware server client. listings_select_own
// (owner_id = auth.uid()) is the access control. Do not add a sponsor_id or
// owner_id filter here, and do not switch this query to the service-role client.
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'
import type { Database } from '../../lib/supabase/types'
import { createRequestSupabase } from '../../server/sponsor-session'

export type PropertyListItem = Pick<
  Database['public']['Tables']['property_listings']['Row'],
  'id' | 'title' | 'city' | 'status' | 'created_at'
>

/**
 * Server-only load path. RLS on `property_listings` must restrict rows to the
 * signed-in sponsor — do not treat a React filter as the security control.
 */
const loadSponsorProperties = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ properties: PropertyListItem[]; error: string | null }> => {
    setResponseHeader('Cache-Control', 'no-store')
    const supabase = createRequestSupabase()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw redirect({ to: '/login' })
    }

    const { data, error } = await supabase
      .from('property_listings')
      .select('id, title, city, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return { properties: [], error: 'Could not load properties. Try again.' }
    }

    return { properties: data ?? [], error: null }
  },
)

export const Route = createFileRoute('/dashboard/properties')({
  loader: () => loadSponsorProperties(),
  component: PropertiesPage,
})

function PropertiesPage() {
  const { properties, error } = Route.useLoaderData()

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Your properties</h1>
        <p className="text-sm text-gray-600">
          Listings you are allowed to manage. Visibility is enforced by the
          database (RLS), not only by this page.
        </p>
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-800"
        >
          {error}
        </div>
      ) : null}

      {!error && properties.length === 0 ? (
        <div className="rounded border border-dashed border-gray-300 px-4 py-8 text-center text-gray-600">
          <p className="font-medium">No properties yet</p>
          <p className="text-sm mt-1">
            When you add a listing, it will show up here for your sponsor
            account only.
          </p>
        </div>
      ) : null}

      {properties.length > 0 ? (
        <ul className="divide-y divide-gray-200 rounded border border-gray-200">
          {properties.map((property) => (
            <li
              key={property.id}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{property.title}</p>
                <p className="text-sm text-gray-600">{property.city}</p>
              </div>
              <span className="text-xs uppercase tracking-wide text-gray-500">
                {property.status}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
