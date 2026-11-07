// src/lib/embeddings/types.ts
// Contract only — adjust EMBEDDING_DIMENSIONS to match docs/embedding-data-model.md

/** Must match the vector column size in your pgvector schema. */
export const EMBEDDING_DIMENSIONS = 1536;

/** Text fields from a PREIshare property used to build one embedding. */
export type PropertyEmbeddingInput = {
  title: string;
  description: string;
  /** Optional location phrase if your data model includes it in the embedded text. */
  locationSummary?: string;
};

export type EmbeddingSuccess = {
  embedding: number[];
  /** Provider/model id for handoff notes (not required for search math). */
  model: string;
  dimensions: number;
};

export type EmbeddingErrorCode =
  | 'EMPTY_INPUT'
  | 'MISSING_API_KEY'
  | 'PROVIDER_ERROR'
  | 'DIMENSION_MISMATCH';

export type EmbeddingFailure = {
  ok: false;
  code: EmbeddingErrorCode;
  message: string;
};

export type EmbeddingResult =
  | ({ ok: true } & EmbeddingSuccess)
  | EmbeddingFailure;

/**
 * Local verification before seeding: confirm a sample vector’s length matches
 * `EMBEDDING_DIMENSIONS` (must equal the pgvector column, currently 1536).
 *
 * Manual check (dev console / scratch script):
 *   assertEmbeddingDimension(sampleVector)
 *   // or: sampleVector.length === EMBEDDING_DIMENSIONS
 */
export function assertEmbeddingDimension(
  embedding: number[],
): { ok: true; dimensions: number } | EmbeddingFailure {
  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    return {
      ok: false,
      code: 'DIMENSION_MISMATCH',
      message: `Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`,
    };
  }
  return { ok: true, dimensions: embedding.length };
}
