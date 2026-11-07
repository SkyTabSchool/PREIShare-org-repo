// Create a property_listings row for the signed-in sponsor.
// The insert uses the cookie-backed anon client so listings_insert_own
// (WITH CHECK owner_id = auth.uid()) still applies. owner_id comes from
// auth.getUser(), never from the form body.
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState, type SubmitEvent } from 'react'
import { createServerFn } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'
import type { Database } from '../../lib/supabase/types'
import { createRequestSupabase } from '../../server/sponsor-session'

type CreatePropertyInput = {
  title: string
  address: string
  city: string
  price: number
  description: string | null
}

type CreatePropertyResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

type ListingInsert = Database['public']['Tables']['property_listings']['Insert']

function readText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function readCreatePropertyInput(input: unknown): CreatePropertyInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Enter a title, address, city, and price.')
  }

  const value = input as Record<string, unknown>
  const title = readText(value.title)
  const address = readText(value.address)
  const city = readText(value.city)
  const description = readText(value.description)
  const price = typeof value.price === 'number' ? value.price : Number(value.price)

  if (!title || !address || !city) {
    throw new Error('Enter a title, address, and city.')
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error('Price must be zero or greater.')
  }

  return {
    title,
    address,
    city,
    price,
    description: description.length > 0 ? description : null,
  }
}

/**
 * Server mutation. Insert runs with the caller's session.
 * RLS WITH CHECK enforces owner_id = auth.uid().
 * A client-supplied owner or sponsor id is ignored.
 */
export const createProperty = createServerFn({ method: 'POST' })
  .validator(readCreatePropertyInput)
  .handler(async ({ data }): Promise<CreatePropertyResult> => {
    setResponseHeader('Cache-Control', 'no-store')
    const supabase = await createRequestSupabase()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { ok: false, error: 'You must be signed in to add a property.' }
    }

    const rowToInsert: ListingInsert = {
      owner_id: user.id,
      title: data.title,
      address_line1: data.address,
      city: data.city,
      price: data.price,
      description: data.description,
    }

    const { data: row, error } = await supabase
      .from('property_listings')
      .insert(rowToInsert)
      .select('id')
      .single()

    if (error || !row) {
      return {
        ok: false,
        error: error?.message ?? 'Could not create property.',
      }
    }

    return { ok: true, id: row.id }
  })

export const Route = createFileRoute('/dashboard/properties/new')({
  component: NewPropertyPage,
})

function NewPropertyPage() {
  const navigate = Route.useNavigate()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    try {
      const result = await createProperty({
        data: {
          title,
          address,
          city,
          price: Number(price),
          description,
        },
      })

      if (!result.ok) {
        setError(result.error)
        return
      }

      await router.invalidate()
      await navigate({ to: '/dashboard/properties' })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create property.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="mx-auto flex max-w-xl flex-col gap-4">
      <header className="space-y-1">
        <Link to="/dashboard/properties" className="text-sm font-medium underline">
          Back to your properties
        </Link>
        <h1 className="text-2xl font-semibold">Add property</h1>
        <p className="text-sm text-gray-600">
          New listings are saved for your sponsor account only (enforced by RLS).
        </p>
      </header>

      <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            disabled={pending}
            className="rounded border border-gray-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Address
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            required
            disabled={pending}
            className="rounded border border-gray-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          City
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            required
            disabled={pending}
            className="rounded border border-gray-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Price
          <input
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            type="number"
            min="0"
            step="0.01"
            required
            disabled={pending}
            className="rounded border border-gray-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={pending}
            rows={4}
            className="rounded border border-gray-300 px-3 py-2 font-normal"
          />
        </label>

        {error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Create property'}
        </button>
      </form>
    </section>
  )
}
