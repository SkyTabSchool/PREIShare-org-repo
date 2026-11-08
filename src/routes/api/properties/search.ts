// POST /api/properties/search
// Reads a natural-language query, ranks listings with searchPropertiesByText,
// and returns JSON. No page UI.
import { createFileRoute } from '@tanstack/react-router'
import { searchPropertiesByText } from '../../../lib/property-search'

export const Route = createFileRoute('/api/properties/search')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}))
          const query = readQuery(body)

          if (!query) {
            return Response.json(
              { error: 'Query is required', results: [] },
              { status: 400 },
            )
          }

          // Server-side only: embed + similarity search live in the helper.
          const results = await searchPropertiesByText(query)

          return Response.json({ query, results })
        } catch (err) {
          console.error('property search failed', err)
          return Response.json(
            { error: 'Search failed', results: [] },
            { status: 500 },
          )
        }
      },
    },
  },
})

function readQuery(body: unknown): string {
  if (!body || typeof body !== 'object') return ''
  const query = (body as { query?: unknown }).query
  return typeof query === 'string' ? query.trim() : ''
}
