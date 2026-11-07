-- PREIshare semantic search storage (pgvector).
-- Follows docs/embedding-data-model.md (properties + embedding) and
-- docs/pgvector-setup-plan.md (extension first, then vector column; no index yet).
--
-- Order matters:
--   1) Enable the vector extension (types/operators do not exist without it).
--   2) Create the properties table with listing text + embedding vector(1536).
--
-- Embedding input recipe (app-side): concatenate title + blank line + description.
-- A vector index is intentionally omitted; sample-scale demos can sequential-scan.

-- Enable pgvector so PostgreSQL can store and compare embedding vectors.
-- Safe to re-run: IF NOT EXISTS avoids errors if the extension is already on.
CREATE EXTENSION IF NOT EXISTS vector;

-- Properties table for PREIshare sample listings + semantic search.
-- embedding dimension MUST match the embedding model used in app code (here: 1536).
CREATE TABLE IF NOT EXISTS public.properties (
  -- Primary key: one stable UUID per investment listing.
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Searchable listing text: title is the short headline shown in ranked results.
  title text NOT NULL,
  -- Searchable listing text: longer write-up; main meaning source for the embedding.
  description text NOT NULL,
  -- Optional display/seed context only (not a search filter in this tutorial).
  city text,
  -- Optional display/seed context only; never treated as the embedding itself.
  price numeric,
  -- Vector column: one embedding per property (from title + description).
  -- NULL until seed/backfill. Do not change 1536 without also changing the TypeScript embedding module.
  embedding vector(1536),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Optional readability aids for humans browsing the schema in Supabase.
COMMENT ON TABLE public.properties IS
  'PREIshare investment listings; embedding powers semantic search.';
COMMENT ON COLUMN public.properties.title IS
  'Short listing headline; part of the canonical embedding input.';
COMMENT ON COLUMN public.properties.description IS
  'Listing write-up; main text embedded for semantic search.';
COMMENT ON COLUMN public.properties.embedding IS
  'pgvector embedding of property text (title + description); dimension 1536; null until backfill.';
