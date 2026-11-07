-- PREIshare semantic search storage (pgvector).
-- Follows docs/pgvector-setup-plan.md and docs/embedding-data-model.md.
--
-- Order matters:
--   1) Enable the vector extension first (types/operators do not exist without it).
--   2) Add a nullable embedding column on the existing property_listings table.
--
-- Do NOT create a parallel "properties" table — that logical entity already maps
-- to public.property_listings (id, title, description, city, price, created_at, …).
-- A vector index is intentionally omitted here; sample-scale demos can sequential-scan.

-- Enable pgvector so PostgreSQL can store and compare embedding vectors.
-- Safe to re-run: IF NOT EXISTS avoids errors if the extension is already on.
CREATE EXTENSION IF NOT EXISTS vector;

-- Add one embedding per listing. Dimension MUST match the embedding model used
-- in app code (planned stand-in: 1536). Keep this number in sync with TypeScript.
-- NULL is allowed until seed/backfill fills vectors for searchable rows.
-- Embedding input recipe (app-side): concatenate title + blank line + description.
ALTER TABLE public.property_listings
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Optional readability aids for humans browsing the schema in Supabase.
COMMENT ON COLUMN public.property_listings.embedding IS
  'pgvector embedding of listing text (title + description); dimension 1536; null until backfill.';
