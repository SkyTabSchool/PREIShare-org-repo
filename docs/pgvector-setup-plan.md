# PREIshare pgvector setup plan

## Purpose

Enable semantic property search storage in Supabase PostgreSQL using pgvector,
aligned with `docs/embedding-data-model.md`. This plan is the contract for the
SQL migration step—no application search UI work here.

## Source of truth

- Data model doc: `docs/embedding-data-model.md`
- Table (logical from model): `properties` → **physical:** `property_listings` (alter the existing table; do not create a parallel `properties` table)
- Embedding column (from model): `embedding`
- Embedding dimension (from model stand-in): `1536`
- Distance / ranking style for demo: cosine-style similarity via pgvector **cosine distance** operator `<=>` (standardize later search SQL on `<=>`; order ascending = closer)

Existing listing columns on `property_listings` already cover the data-model fields needed for this slice (`id`, `title`, `description`, `city`, `price`, `created_at`). This migration only adds `embedding`. Note: `description` remains nullable on the table today; searchable seed rows still need meaningful `description` text plus a non-null `embedding` after backfill. Existing owner RLS stays as-is (no public SELECT today)—this plan does not redesign auth or policies.

## Migration goals (what “done” means)

1. pgvector extension is available in the database.
2. `property_listings` exists with listing fields from the data model plus a
   non-lossy vector column `embedding vector(1536)`.
3. It is valid for `embedding` to be null until a backfill/seed job runs.
4. A beginner demo can run a similarity query later (`match_*` / search function
   is a **follow-up** migration—out of scope here).
5. Verification queries prove extension + table + vector column shape.

## Safe migration order (must not be reordered)

| Order | Step | Why this order |
|------:|------|----------------|
| 1 | Enable extension `vector` (pgvector) | Vector column types and operators do not exist until the extension is on. |
| 2 | Alter `property_listings` to add `embedding vector(1536)` (other model columns already present) | Column creation depends on the extension. |
| 3 | (Optional for tiny demos) Add a vector index — **out of scope for first migration** | Indexes are not required to store vectors; add only after the column exists. For very small sample data, sequential scan is OK. |
| 4 | Run verification SQL | Confirms the schema before any seed or app code. |

**Do not** create vector columns before enabling the extension.  
**Do not** invent a second dimension or a second embedding column name.

## Similarity approach (beginner demo)

- **Choice:** Use cosine-style similarity ranking consistently in later search SQL
  via the pgvector cosine distance operator `<=>` (smaller distance = closer meaning;
  order results ascending by distance).
- **Why:** Buyers care about “meaning closeness,” and cosine-style scoring is a
  common default for text embeddings (aligned with the data model and vector-search
  learner notes).
- **Tradeoff:** Exact scans over a handful of sample rows are simple and fine for
  learning. Approximate indexes help at larger scale but add setup complexity;
  for this tutorial’s sample set, correctness and clear SQL matter more than
  micro-optimization.

## Index recommendation

- **Demo scale (tens of rows):** Index optional; **no index required for sample seed.**
  First migration: do **not** add a vector index.
- **If adding an index later:** Create it only after the `embedding` column exists;
  note that many rows should be non-null before the index is useful; keep dimension
  `1536` and cosine / `<=>` operator class aligned when you add one in a later change.

## Environment values (high level—no secrets in this file)

List names only; real values live in local env / Supabase dashboard
(see `.env.example` and `docs/env-var-checklist.md`):

- `SUPABASE_URL` — project API URL (server); browser uses `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — trusted server/seed paths only (never expose to the browser; never use a `VITE_` prefix)
- `DATABASE_URL` or Supabase DB connection string — if migrations run via CLI
- Embedding provider API key name (e.g. `OPENAI_API_KEY`) — needed when generating
  vectors later, not required to enable pgvector itself

## Verification queries (run after migration)

Intent of each check (exact SQL may be refined in the migration step):

1. Show that extension `vector` is installed.
2. Describe `property_listings` and confirm `embedding` is type `vector` with
   dimension **1536**.
3. Insert or select a row with a null embedding to prove nulls are allowed.
4. (Optional) Compare two literal vectors with `<=>` to prove pgvector operators work.

Example sketch (illustrative—column checks use table `property_listings`; tiny
`vector(3)` only for operator smoke):

```sql
-- 1) extension present
select * from pg_extension where extname = 'vector';

-- 2) column shape (Supabase SQL editor)
select column_name, data_type, udt_name
from information_schema.columns
where table_name = 'property_listings';

-- 4) operator smoke test (illustrative small dim; real column is vector(1536))
-- select '[1,2,3]'::vector(3) <=> '[1,2,4]'::vector(3) as distance;
```

## Out of scope for this migration plan

- Generating real embeddings for listings (later module/seed steps)
- Search API routes and React UI
- Production RLS policies hardening beyond what the model already requires
- Hybrid keyword + vector ranking, filters, or re-ranking
- Vector index in the first migration
- Creating a separate `properties` table

## Handoff to next step

The coding agent must implement **only** ordered goals 1–2 (enable `vector`, then
alter `property_listings` to add nullable `embedding vector(1536)`). Goal 3 (index)
is **not** in-scope for the first migration. Goal 4 is verification after migrate.
Use column name `embedding` and dimension **1536** from this plan / the data-model
stand-in; must not silently change vector size or table name.
