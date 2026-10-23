// Create page under the protected /dashboard layout.
// Validates with createListingSchema, then persists through createListing.
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ListingForm, type ListingFormValues } from '../../../components/listings/ListingForm'
import { createListingSchema } from '../../../lib/listings/schema'
import { createListing } from '../../../server/listings'

export const Route = createFileRoute('/dashboard/listings/new')({
  component: NewListingPage,
})

function NewListingPage() {
  const navigate = Route.useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(values: ListingFormValues) {
    setErrorMessage(null)
    setFieldErrors(null)

    const parsed = createListingSchema.safeParse(toSchemaInput(values))
    if (!parsed.success) {
      setErrorMessage('Check the highlighted fields.')
      setFieldErrors(fieldErrorsFromIssues(parsed.error.issues))
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createListing({ data: parsed.data })
      if (!result.ok) {
        setErrorMessage(result.error)
        setFieldErrors(result.fieldErrors ?? null)
        return
      }
      await navigate({ to: '/dashboard/listings' })
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : 'Could not create listing.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section aria-labelledby="new-listing-heading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Link to="/dashboard/listings" className="w-fit text-sm font-semibold text-slate-700">
          Back to listings
        </Link>
        <h1
          id="new-listing-heading"
          className="text-2xl font-semibold tracking-tight text-slate-900"
        >
          Add a property listing
        </h1>
      </div>
      <ListingForm
        onSubmit={handleSubmit}
        submitLabel="Create listing"
        errorMessage={errorMessage}
        fieldErrors={fieldErrors}
        isSubmitting={isSubmitting}
      />
    </section>
  )
}

function toSchemaInput(values: ListingFormValues) {
  return {
    title: values.title,
    address_line1: values.address_line1,
    city: values.city,
    price: values.price,
    country: values.country,
    status: values.status,
    ...(values.description !== undefined ? { description: values.description } : {}),
    ...(values.region !== undefined ? { region: values.region } : {}),
    ...(values.postal_code !== undefined ? { postal_code: values.postal_code } : {}),
  }
}

function fieldErrorsFromIssues(
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>,
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of issues) {
    const field = issue.path[0]
    if (typeof field !== 'string') continue
    const messages = fieldErrors[field] ?? []
    messages.push(issue.message)
    fieldErrors[field] = messages
  }
  return fieldErrors
}
