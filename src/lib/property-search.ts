// Server-only. Do not import this file from browser components.
// Embeds a buyer query with the same model as listings, then ranks
// public.properties via match_properties (cosine similarity; higher = better).

import { generatePropertyEmbedding } from './embeddings/generate'
import { createSupabaseServiceRoleClient } from './supabase.server'
import type { Database } from './supabase/types'

type MatchPropertiesRow =
  Database['public']['Functions']['match_properties']['Returns'][number]

/** One ranked listing from match_properties. similarity is larger for a better match. */
export type PropertyMatch = {
  id: string
  title: string
  description: string
  city: string | null
  state: string | null
  price: number | null
  created_at: string
  similarity: number
}

/**
 * Semantic search over stored property embeddings.
 * Empty or whitespace-only queries return no rows.
 * Uses the service-role client: match_properties is not granted to anon,
 * and embedding generation reads EMBEDDING_API_KEY on the server.
 */
export async function searchPropertiesByText(
  query: string,
  matchCount = 5,
): Promise<PropertyMatch[]> {
  const trimmed = query.trim()
  if (!trimmed) {
    return []
  }

  const embedded = await generatePropertyEmbedding({
    title: '',
    description: trimmed,
  })
  if (!embedded.ok) {
    throw new Error(`embedding failed (${embedded.code}): ${embedded.message}`)
  }

  const supabase = createSupabaseServiceRoleClient()
  const { data, error } = await supabase.rpc('match_properties', {
    query_embedding: embedded.embedding,
    match_count: matchCount,
  })

  if (error) {
    throw new Error(`match_properties failed: ${error.message}`)
  }

  return (data ?? []).map(toPropertyMatch)
}

function toPropertyMatch(row: MatchPropertiesRow): PropertyMatch {
  const similarity = asFiniteNumber(row.similarity)
  if (similarity === null) {
    throw new Error('match_properties returned a row without a numeric similarity score.')
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    city: row.city,
    state: row.state,
    price: asFiniteNumber(row.price),
    created_at: row.created_at,
    similarity,
  }
}

/** PostgREST may return numeric/float columns as numbers or numeric strings. */
function asFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}
