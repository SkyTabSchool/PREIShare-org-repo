// Shared listing validation for server actions and later sponsor forms.
// Columns follow public.property_listings in
// supabase/migrations/20250321000000_property_listings.sql
// and docs/data-model/property-listings-schema.md.
//
// Required on create (NOT NULL, no default the sponsor can skip):
//   title, address_line1, city, price
// Optional on create:
//   description, region, postal_code (nullable)
//   country (NOT NULL, default 'US')
//   status (NOT NULL, default 'draft')
// owner_id is not an input. The server sets it from the session user id.
//
// Update requires id. Every other field is optional and, when omitted,
// is left unchanged. owner_id cannot be supplied or reassigned.
import { z } from 'zod'
import type { PropertyListingStatus } from '../supabase/types'

/** Postgres check: status in ('draft', 'published', 'archived'). */
function listingStatuses<const T extends readonly PropertyListingStatus[]>(
  statuses: T &
    ([PropertyListingStatus] extends [T[number]] ? unknown : 'missing status') &
    ([T[number]] extends [PropertyListingStatus] ? unknown : 'unknown status'),
): T {
  return statuses
}

export const LISTING_STATUSES = listingStatuses([
  'draft',
  'published',
  'archived',
] as const)

export const listingStatusSchema = z.enum(LISTING_STATUSES, {
  error: 'Status must be draft, published, or archived',
})

export type ListingStatus = z.infer<typeof listingStatusSchema>

const MAX_PRICE = 9_999_999_999.99

function hasAtMostTwoDecimalPlaces(value: number): boolean {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-6
}

const priceSchema = z.preprocess(
  (value) => (value === '' || value === null ? Number.NaN : value),
  z.coerce
    .number({ error: 'Price must be a number' })
    .finite('Price must be a number')
    .nonnegative('Price must be zero or greater')
    .max(MAX_PRICE, 'Price must be at most 9,999,999,999.99')
    .refine(hasAtMostTwoDecimalPlaces, 'Price can have at most two decimal places'),
)

/** Nullable text. Blank strings become null. Omitted stays omitted. */
function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((value) => {
      if (value == null) return value
      return value.length === 0 ? null : value
    })
}

const countrySchema = z
  .string()
  .trim()
  .length(2, 'Country must be a 2-letter code')
  .toUpperCase()

export const createListingSchema = z.object({
  title: z.string({ error: 'Title is required' }).trim().min(1, 'Title is required').max(200),
  description: optionalText(5000),
  address_line1: z
    .string({ error: 'Address is required' })
    .trim()
    .min(1, 'Address is required')
    .max(300),
  city: z.string({ error: 'City is required' }).trim().min(1, 'City is required').max(120),
  region: optionalText(120),
  postal_code: optionalText(20),
  country: countrySchema.default('US'),
  price: priceSchema,
  status: listingStatusSchema.default('draft'),
})

export const updateListingSchema = z.object({
  id: z.uuid({ error: 'Listing id must be a valid UUID' }),
  title: z.string().trim().min(1, 'Title is required').max(200).optional(),
  description: optionalText(5000),
  address_line1: z.string().trim().min(1, 'Address is required').max(300).optional(),
  city: z.string().trim().min(1, 'City is required').max(120).optional(),
  region: optionalText(120),
  postal_code: optionalText(20),
  country: countrySchema.optional(),
  price: priceSchema.optional(),
  status: listingStatusSchema.optional(),
})

export type CreateListingInput = z.infer<typeof createListingSchema>
export type UpdateListingInput = z.infer<typeof updateListingSchema>
