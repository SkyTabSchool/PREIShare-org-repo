// src/lib/embeddings/generate.ts
// Scaffold shape — provider call is abstracted; secrets from env only.
// Server-side only: reads EMBEDDING_API_KEY (never VITE_* / never hard-code).

import {
  EMBEDDING_DIMENSIONS,
  type EmbeddingResult,
  type PropertyEmbeddingInput,
} from './types';

/** OpenAI-compatible embeddings endpoint; override with EMBEDDING_API_URL if needed. */
const DEFAULT_EMBEDDING_API_URL = 'https://api.openai.com/v1/embeddings';

/** Default model outputs 1536 dims (matches pgvector column / EMBEDDING_DIMENSIONS). */
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';

/**
 * Combine property fields into one string for the embedding model.
 * Keep this pure and easy to unit-test mentally: same fields → same text.
 */
export function buildEmbeddingText(input: PropertyEmbeddingInput): string {
  const parts = [input.title, input.description, input.locationSummary ?? '']
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.join('\n\n');
}

/**
 * Returns true when the vector is a number[] of the expected length.
 */
export function assertEmbeddingDimension(
  embedding: number[],
  expected = EMBEDDING_DIMENSIONS
): boolean {
  return (
    Array.isArray(embedding) &&
    embedding.length === expected &&
    embedding.every((n) => typeof n === 'number' && Number.isFinite(n))
  );
}

/**
 * Generate an embedding for property text.
 * - Reads API credentials from environment variables (never hard-code).
 * - Validates empty input and dimension length before returning ok: true.
 */
export async function generatePropertyEmbedding(
  input: PropertyEmbeddingInput
): Promise<EmbeddingResult> {
  const text = buildEmbeddingText(input);
  if (!text) {
    return {
      ok: false,
      code: 'EMPTY_INPUT',
      message: 'Property title and description are empty; nothing to embed.',
    };
  }

  const apiKey = process.env.EMBEDDING_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      code: 'MISSING_API_KEY',
      message:
        'Set EMBEDDING_API_KEY in your environment before generating embeddings.',
    };
  }

  const model = process.env.EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL;

  try {
    const embedding = await callEmbeddingProvider(text, apiKey, model);

    if (!assertEmbeddingDimension(embedding)) {
      return {
        ok: false,
        code: 'DIMENSION_MISMATCH',
        message: `Expected ${EMBEDDING_DIMENSIONS} numbers, got ${embedding.length}.`,
      };
    }

    return {
      ok: true,
      embedding,
      model,
      dimensions: embedding.length,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown provider error';
    return { ok: false, code: 'PROVIDER_ERROR', message };
  }
}

type EmbeddingProviderResponse = {
  data?: Array<{ embedding?: number[] }>;
  error?: { message?: string };
};

/** Internal helper — keep provider details out of the public export surface. */
async function callEmbeddingProvider(
  text: string,
  apiKey: string,
  model: string
): Promise<number[]> {
  const endpoint = process.env.EMBEDDING_API_URL ?? DEFAULT_EMBEDDING_API_URL;

  // text-embedding-3-* accepts `dimensions`; older models (e.g. ada-002) reject it.
  const body: {
    model: string;
    input: string;
    dimensions?: number;
  } = { model, input: text };
  if (model.startsWith('text-embedding-3')) {
    body.dimensions = EMBEDDING_DIMENSIONS;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as EmbeddingProviderResponse;

  if (!response.ok) {
    const detail = payload.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Embedding provider error: ${detail}`);
  }

  const embedding = payload.data?.[0]?.embedding;
  if (!embedding) {
    throw new Error('Embedding provider returned no embedding vector.');
  }

  return embedding;
}
