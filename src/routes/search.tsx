// Buyer search page. Posts to /api/properties/search and renders that
// response only. Do not sort, filter by score, or invent a similarity value.
import { createFileRoute } from '@tanstack/react-router'
import { useState, type SubmitEvent } from 'react'

export const Route = createFileRoute('/search')({
  component: PropertySearchPage,
})

type SearchResult = {
  id: string
  title: string
  description: string
  similarity: number | null
}

type SearchStatus = 'idle' | 'loading' | 'error' | 'done'

function PropertySearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setStatus('done')
      setErrorMessage('Type a description of the property you want.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/properties/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      })
      const data: unknown = await response.json()
      if (!response.ok) {
        throw new Error(readError(data))
      }
      // Server order and server scores. Do not sort or re-score here.
      setResults(readResults(data))
      setStatus('done')
    } catch (err) {
      setResults([])
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Search failed')
    }
  }

  return (
    <main className="demo-page">
      <section className="demo-panel mx-auto max-w-xl">
        <h1 className="demo-title text-3xl">PREIshare property search</h1>
        <p className="demo-muted mt-2 mb-6 text-sm">
          Describe the kind of investment property you want. We match meaning, not only keywords.
        </p>

        <form className="grid gap-4" onSubmit={(event) => void onSubmit(event)}>
          <label className="grid gap-1 text-sm font-semibold text-[var(--sea-ink)]" htmlFor="q">
            Search
            <input
              id="q"
              className="demo-input font-normal"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="quiet cabin near water with rental upside"
            />
          </label>
          <button className="demo-button w-fit" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Searching…' : 'Search'}
          </button>
        </form>

        {status === 'loading' ? (
          <p className="demo-muted mt-4 mb-0 text-sm" role="status">
            Searching…
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mt-4 mb-0 text-sm text-[#9f3030]" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {status === 'done' && results.length === 0 && !errorMessage ? (
          <p className="demo-muted mt-4 mb-0 text-sm">
            No matching properties yet. Try different words from the sample listings.
          </p>
        ) : null}

        {results.length > 0 ? (
          <ul className="mt-6 grid list-none gap-3 p-0">
            {results.map((result) => (
              <li key={result.id} className="demo-list-item">
                <strong className="text-[var(--sea-ink)]">{result.title}</strong>
                <p className="mt-1 mb-2 text-sm text-[var(--sea-ink-soft)]">{snippet(result.description)}</p>
                <p className="m-0 text-sm text-[var(--sea-ink)]">
                  Similarity: {formatSimilarity(result.similarity)}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  )
}

function readError(data: unknown): string {
  if (data && typeof data === 'object' && 'error' in data) {
    const error = (data as { error?: unknown }).error
    if (typeof error === 'string' && error.trim()) return error
  }
  return 'Search failed'
}

/** Keep the API array order. Missing scores stay missing. */
function readResults(data: unknown): SearchResult[] {
  if (!data || typeof data !== 'object' || !('results' in data)) return []
  const results = (data as { results?: unknown }).results
  if (!Array.isArray(results)) return []

  const rows: SearchResult[] = []
  for (const row of results) {
    if (!row || typeof row !== 'object') continue
    const item = row as Record<string, unknown>
    if (typeof item.id !== 'string' || typeof item.title !== 'string') continue
    rows.push({
      id: item.id,
      title: item.title,
      description: typeof item.description === 'string' ? item.description : '',
      similarity:
        typeof item.similarity === 'number' && Number.isFinite(item.similarity)
          ? item.similarity
          : null,
    })
  }
  return rows
}

function snippet(description: string): string {
  if (description.length <= 160) return description
  return `${description.slice(0, 160)}…`
}

function formatSimilarity(similarity: number | null): string {
  if (similarity === null) return '—'
  return similarity.toFixed(3)
}
