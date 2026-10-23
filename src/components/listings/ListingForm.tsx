// Labeled sponsor fields. Names match createListingSchema in src/lib/listings/schema.ts.
import type { FormEvent, ReactNode } from 'react'
import { LISTING_STATUSES, type ListingStatus } from '../../lib/listings/schema'

export type ListingFormValues = {
  title: string
  address_line1: string
  city: string
  price: string
  country: string
  status: ListingStatus
  description?: string
  region?: string
  postal_code?: string
}

export type ListingFormProps = {
  onSubmit: (values: ListingFormValues) => void | Promise<void>
  submitLabel?: string
  errorMessage?: string | null
  fieldErrors?: Record<string, string[]> | null
  isSubmitting?: boolean
}

export function ListingForm({
  onSubmit,
  submitLabel = 'Save listing',
  errorMessage = null,
  fieldErrors = null,
  isSubmitting = false,
}: ListingFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const description = optionalText(data, 'description')
    const region = optionalText(data, 'region')
    const postalCode = optionalText(data, 'postal_code')
    const status = readStatus(data.get('status'))

    const values: ListingFormValues = {
      title: String(data.get('title') ?? ''),
      address_line1: String(data.get('address_line1') ?? ''),
      city: String(data.get('city') ?? ''),
      price: String(data.get('price') ?? ''),
      country: String(data.get('country') ?? ''),
      status,
    }
    if (description !== undefined) values.description = description
    if (region !== undefined) values.region = region
    if (postalCode !== undefined) values.postal_code = postalCode

    void onSubmit(values)
  }

  return (
    <form className="grid max-w-xl gap-4" onSubmit={handleSubmit}>
      {errorMessage ? (
        <p className="m-0 text-sm text-[#9f3030]" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <Field
        id="listing-title"
        label="Title"
        messages={messagesFor(fieldErrors, 'title')}
      >
        <input
          id="listing-title"
          name="title"
          type="text"
          required
          maxLength={200}
          disabled={isSubmitting}
          aria-invalid={hasMessages(fieldErrors, 'title')}
          aria-describedby={describedBy('listing-title', fieldErrors, 'title')}
          className="demo-input font-normal"
        />
      </Field>

      <Field
        id="listing-address"
        label="Street address"
        messages={messagesFor(fieldErrors, 'address_line1')}
      >
        <input
          id="listing-address"
          name="address_line1"
          type="text"
          required
          maxLength={300}
          autoComplete="street-address"
          disabled={isSubmitting}
          aria-invalid={hasMessages(fieldErrors, 'address_line1')}
          aria-describedby={describedBy('listing-address', fieldErrors, 'address_line1')}
          className="demo-input font-normal"
        />
      </Field>

      <Field
        id="listing-city"
        label="City"
        messages={messagesFor(fieldErrors, 'city')}
      >
        <input
          id="listing-city"
          name="city"
          type="text"
          required
          maxLength={120}
          autoComplete="address-level2"
          disabled={isSubmitting}
          aria-invalid={hasMessages(fieldErrors, 'city')}
          aria-describedby={describedBy('listing-city', fieldErrors, 'city')}
          className="demo-input font-normal"
        />
      </Field>

      <Field
        id="listing-region"
        label="Region"
        messages={messagesFor(fieldErrors, 'region')}
      >
        <input
          id="listing-region"
          name="region"
          type="text"
          maxLength={120}
          autoComplete="address-level1"
          disabled={isSubmitting}
          aria-invalid={hasMessages(fieldErrors, 'region')}
          aria-describedby={describedBy('listing-region', fieldErrors, 'region')}
          className="demo-input font-normal"
        />
      </Field>

      <Field
        id="listing-postal-code"
        label="Postal code"
        messages={messagesFor(fieldErrors, 'postal_code')}
      >
        <input
          id="listing-postal-code"
          name="postal_code"
          type="text"
          maxLength={20}
          autoComplete="postal-code"
          disabled={isSubmitting}
          aria-invalid={hasMessages(fieldErrors, 'postal_code')}
          aria-describedby={describedBy('listing-postal-code', fieldErrors, 'postal_code')}
          className="demo-input font-normal"
        />
      </Field>

      <Field
        id="listing-country"
        label="Country"
        messages={messagesFor(fieldErrors, 'country')}
      >
        <input
          id="listing-country"
          name="country"
          type="text"
          required
          minLength={2}
          maxLength={2}
          defaultValue="US"
          autoComplete="country"
          disabled={isSubmitting}
          aria-invalid={hasMessages(fieldErrors, 'country')}
          aria-describedby={describedBy('listing-country', fieldErrors, 'country')}
          className="demo-input font-normal"
        />
      </Field>

      <Field
        id="listing-price"
        label="Price"
        messages={messagesFor(fieldErrors, 'price')}
      >
        <input
          id="listing-price"
          name="price"
          type="number"
          required
          min={0}
          step="0.01"
          inputMode="decimal"
          disabled={isSubmitting}
          aria-invalid={hasMessages(fieldErrors, 'price')}
          aria-describedby={describedBy('listing-price', fieldErrors, 'price')}
          className="demo-input font-normal"
        />
      </Field>

      <Field
        id="listing-description"
        label="Description"
        messages={messagesFor(fieldErrors, 'description')}
      >
        <textarea
          id="listing-description"
          name="description"
          maxLength={5000}
          disabled={isSubmitting}
          aria-invalid={hasMessages(fieldErrors, 'description')}
          aria-describedby={describedBy('listing-description', fieldErrors, 'description')}
          className="demo-textarea font-normal"
        />
      </Field>

      <Field
        id="listing-status"
        label="Status"
        messages={messagesFor(fieldErrors, 'status')}
      >
        <select
          id="listing-status"
          name="status"
          defaultValue="draft"
          disabled={isSubmitting}
          aria-invalid={hasMessages(fieldErrors, 'status')}
          aria-describedby={describedBy('listing-status', fieldErrors, 'status')}
          className="demo-select font-normal"
        >
          {LISTING_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </Field>

      <button className="demo-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}

function Field({
  id,
  label,
  messages,
  children,
}: {
  id: string
  label: string
  messages: string[] | undefined
  children: ReactNode
}) {
  return (
    <div className="grid gap-1">
      <label className="text-sm font-semibold text-slate-900" htmlFor={id}>
        {label}
      </label>
      {children}
      {messages && messages.length > 0 ? (
        <p id={`${id}-error`} className="m-0 text-sm text-[#9f3030]">
          {messages.join(' ')}
        </p>
      ) : null}
    </div>
  )
}

function optionalText(data: FormData, name: string): string | undefined {
  const value = String(data.get(name) ?? '').trim()
  return value.length > 0 ? value : undefined
}

function readStatus(value: FormDataEntryValue | null): ListingStatus {
  if (typeof value !== 'string') return 'draft'
  for (const status of LISTING_STATUSES) {
    if (status === value) return status
  }
  return 'draft'
}

function messagesFor(
  fieldErrors: Record<string, string[]> | null,
  name: string,
): string[] | undefined {
  return fieldErrors?.[name]
}

function hasMessages(fieldErrors: Record<string, string[]> | null, name: string): boolean {
  const messages = fieldErrors?.[name]
  return messages !== undefined && messages.length > 0
}

function describedBy(
  id: string,
  fieldErrors: Record<string, string[]> | null,
  name: string,
): string | undefined {
  return hasMessages(fieldErrors, name) ? `${id}-error` : undefined
}
