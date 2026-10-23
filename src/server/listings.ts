// SERVER-ONLY. Do not import this module from browser components.
// List, create, and update public.property_listings for the signed-in sponsor.
//
// createServerSupabaseClient uses the service-role key and bypasses RLS, so
// every query sets or filters owner_id from getUser(). The request body cannot
// choose the owner. UI routes are not wired here.
import { createServerFn } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'
import { z } from 'zod'
import { getUser } from '../lib/auth/session'
import {
  createListingSchema,
  updateListingSchema,
  type CreateListingInput,
  type UpdateListingInput,
} from '../lib/listings/schema'
import { createServerSupabaseClient } from '../lib/supabase/server'
import type { Database } from '../lib/supabase/types'

type ListingInsert = Database['public']['Tables']['property_listings']['Insert']
type ListingUpdate = Database['public']['Tables']['property_listings']['Update']

export type ListingRow = Database['public']['Tables']['property_listings']['Row']

export type ListingsResult =
  | { ok: true; listings: ListingRow[] }
  | { ok: false; error: string }

export type ListingMutationResult =
  | { ok: true; listing: ListingRow }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

const LISTING_COLUMNS =
  'id, owner_id, title, description, address_line1, city, region, postal_code, country, price, status, created_at, updated_at'

function privateResponse() {
  setResponseHeader('Cache-Control', 'no-store')
}

function fieldErrorsFrom(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const field = issue.path[0]
    if (typeof field !== 'string') continue
    const messages = fieldErrors[field] ?? []
    messages.push(issue.message)
    fieldErrors[field] = messages
  }
  return fieldErrors
}

function invalidInput(error: z.ZodError): ListingMutationResult {
  return {
    ok: false,
    error: 'Check the highlighted fields.',
    fieldErrors: fieldErrorsFrom(error),
  }
}

function toListingRow(row: ListingRow): ListingRow | null {
  const price = Number(row.price)
  if (!Number.isFinite(price)) return null
  return { ...row, price }
}

function createPayload(input: CreateListingInput, ownerId: string): ListingInsert {
  const row: ListingInsert = {
    owner_id: ownerId,
    title: input.title,
    address_line1: input.address_line1,
    city: input.city,
    country: input.country,
    price: input.price,
    status: input.status,
  }
  if (input.description !== undefined) row.description = input.description
  if (input.region !== undefined) row.region = input.region
  if (input.postal_code !== undefined) row.postal_code = input.postal_code
  return row
}

function updatePayload(input: UpdateListingInput): ListingUpdate {
  const patch: ListingUpdate = {}
  if (input.title !== undefined) patch.title = input.title
  if (input.description !== undefined) patch.description = input.description
  if (input.address_line1 !== undefined) patch.address_line1 = input.address_line1
  if (input.city !== undefined) patch.city = input.city
  if (input.region !== undefined) patch.region = input.region
  if (input.postal_code !== undefined) patch.postal_code = input.postal_code
  if (input.country !== undefined) patch.country = input.country
  if (input.price !== undefined) patch.price = input.price
  if (input.status !== undefined) patch.status = input.status
  return patch
}

/** Listings owned by the signed-in sponsor. */
export const listMyListings = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ListingsResult> => {
    privateResponse()
    const user = await getUser()
    if (!user) {
      return { ok: false, error: 'You must be signed in to view listings.' }
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('property_listings')
      .select(LISTING_COLUMNS)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error || !data) {
      return { ok: false, error: 'Could not load listings. Try again.' }
    }

    const listings: ListingRow[] = []
    for (const row of data) {
      const listing = toListingRow(row)
      if (!listing) {
        return { ok: false, error: 'Could not load listings. Try again.' }
      }
      listings.push(listing)
    }

    return { ok: true, listings }
  },
)

/** Create a listing owned by the session user. */
export const createListing = createServerFn({ method: 'POST' })
  .validator((input: unknown) => input)
  .handler(async ({ data }): Promise<ListingMutationResult> => {
    privateResponse()
    const parsed = createListingSchema.safeParse(data)
    if (!parsed.success) return invalidInput(parsed.error)

    const user = await getUser()
    if (!user) {
      return { ok: false, error: 'You must be signed in to create a listing.' }
    }

    const supabase = createServerSupabaseClient()
    const { data: row, error } = await supabase
      .from('property_listings')
      .insert(createPayload(parsed.data, user.id))
      .select(LISTING_COLUMNS)
      .single()

    if (error || !row) {
      return {
        ok: false,
        error: 'Could not create listing. Check your input and try again.',
      }
    }

    const listing = toListingRow(row)
    if (!listing) {
      return { ok: false, error: 'Could not create listing. Check your input and try again.' }
    }

    return { ok: true, listing }
  })

/** Update a listing only when owner_id matches the session user. */
export const updateListing = createServerFn({ method: 'POST' })
  .validator((input: unknown) => input)
  .handler(async ({ data }): Promise<ListingMutationResult> => {
    privateResponse()
    const parsed = updateListingSchema.safeParse(data)
    if (!parsed.success) return invalidInput(parsed.error)

    const user = await getUser()
    if (!user) {
      return { ok: false, error: 'You must be signed in to update a listing.' }
    }

    const patch = updatePayload(parsed.data)
    if (Object.keys(patch).length === 0) {
      return { ok: false, error: 'No fields to update.' }
    }

    const supabase = createServerSupabaseClient()
    const { data: row, error } = await supabase
      .from('property_listings')
      .update(patch)
      .eq('id', parsed.data.id)
      .eq('owner_id', user.id)
      .select(LISTING_COLUMNS)
      .single()

    if (error || !row) {
      return {
        ok: false,
        error: 'Could not update listing. It may not exist or you may not own it.',
      }
    }

    const listing = toListingRow(row)
    if (!listing) {
      return {
        ok: false,
        error: 'Could not update listing. It may not exist or you may not own it.',
      }
    }

    return { ok: true, listing }
  })
