# PREIshare embedding data model

## Purpose

Software-ready design for property listings and their embedding vectors.
This doc is the contract for pgvector migrations, TypeScript types, seed/backfill, and similarity search.
It is not SQL and not application code yet.

Every later step (migration, helpers, seed, ranked search UI) should stay checkable against
[`docs/semantic-search-requirements.md`](semantic-search-requirements.md)—especially the
example queries (section 3) and success criteria (section 4).

## Sources

- [`docs/semantic-search-requirements.md`](semantic-search-requirements.md)
- [`docs/embeddings-learner-notes.md`](embeddings-learner-notes.md)
- [`docs/vector-search-learner-notes.md`](vector-search-learner-notes.md)

## Overview

Each **property** is one investment listing PREIshare can show in search.
Each property has normal text/number fields humans read, plus one **embedding** column:
a fixed-length list of numbers that captures the meaning of selected listing text
(see embeddings learner notes: similar meaning → similar number lists).

Search will:

1. Embed the buyer’s natural-language query with the **same model and dimension** used for listings.
2. Compare that query vector to stored property embeddings.
3. Rank by similarity (best match first), not only exact keyword matches.

That pipeline is what lets a query like “quiet cabin near water with good rental upside”
surface a lake house with strong vacation-booking language even when those exact words
never appear together in the listing.

## Identifiers

| Field | Type (logical) | Required | Notes |
|-------|----------------|----------|-------|
| id | UUID (or stable text id) | yes | Primary key; unique per listing |

## Core listing fields (this tutorial slice)

Requirements success criteria call for sample properties with **description text** and
stored vectors. Vector-search notes also expect a human-readable label (title/summary)
next to each ranked hit for debugging and demo UI.

| Field | Type (logical) | Required | Notes |
|-------|----------------|----------|-------|
| title | text | yes | Short headline for the listing; shown in ranked results |
| description | text | yes | Longer property write-up; main meaning source for the embedding |
| city | text | no | Optional display/seed context only. **Not** a search filter in this tutorial (requirements §6 lists price/beds-style filters out of scope) |
| price | number | no | Optional display/seed context only; never treated as the embedding itself |
| created_at | timestamp | yes | When the row was inserted |

Do **not** expand this tutorial model into photos, full auth, payments, beds/baths filters,
address blocks, status workflows, or ownership/`owner_id` RLS concerns. Those live in other
docs (for example sponsor dashboard / `property_listings` work) and are out of scope for
this semantic-search slice unless a later handoff explicitly maps onto them.

## What text is embedded

**Embedding input (canonical string):** concatenate `title` and `description` with a clear
separator:

```text
{title}

{description}
```

Rules:

- Always build the embedding from this same recipe so re-embeds and query-time comparisons stay consistent.
- Do **not** embed `price`, `id`, or `city` as if they were narrative meaning.
- Store the **raw** `title` and `description` unchanged; the vector is a separate column derived from them.
- Empty or missing description makes a row a weak or invalid semantic candidate—seed data for the demo queries must have meaningful description text (requirements §3–§4).

### Why this recipe

Embeddings learner notes emphasize that generation (text → number list) and storage
(number list on the row) are separate stages. The canonical string is the single input
both seed/backfill and any later “re-embed this listing” path must use, so rankings stay
comparable end-to-end.

## Embedding column

| Field | Type (logical) | Required | Notes |
|-------|----------------|----------|-------|
| embedding | vector(DIMENSION_TODO) | yes after backfill | Fixed dimension; same size for every row and every query |

### Dimension placeholder

- Use **DIMENSION_TODO** (common docs stand-in: 1536) until the embedding model is chosen in a later step.
- **Critical:** query vectors and stored vectors must use the **same model and same dimension**. Mismatched sizes break insert or search, and mixed models make “near vs far” look random (embeddings + vector-search notes).
- When the real model is chosen, replace `DIMENSION_TODO` everywhere (this doc, migration, TypeScript types) in one pass.

### Nullability and backfill

- New rows may allow `embedding` null only as a temporary state during insert-then-embed.
- After seed/backfill, every **searchable** property should have a non-null embedding.
- Intended lifecycle:

  1. Create listing text (`title` + `description`)
  2. Generate embedding from the canonical string
  3. Store the vector on the row
  4. Row becomes eligible for semantic search

## Separation of concerns

| Concern | Where it lives |
|---------|----------------|
| Human-readable listing | `title`, `description`, and other scalar columns |
| Meaning for search | `embedding` vector column only |
| Similarity metric | Decided at query time; **planned reminder for this tutorial: cosine similarity** (distance vs similarity score direction must match SQL—see vector-search learner notes §5) |

Do not replace `description` with the vector. You need both: text for the UI and explainability, vector for ranking.

Ranked hits for the first demo should expose at least: property `id`, a human-readable label (`title` and/or short description snippet), and the similarity/distance **score** for debugging—not score alone (vector-search notes §5–§7).

## Similarity ranking (data-model reminder)

This doc does not define SQL operators yet. For implementers, the ranking contract from the learner notes is:

1. Embed the buyer query with the same model/dimension as listings.
2. Compare the query embedding to stored `embedding` values (not to raw description text alone).
3. Order best-first for the chosen metric; support **top-K** (example default to try: K = 5).
4. Demo seed text should support requirements example queries (cabin/water/rental, family/schools, downtown walkable condo) and keep farmland-style near-miss control from dominating those results.

## In scope vs out of scope (data model)

**In scope**

- One properties table (or equivalent logical entity) with `id`, listing fields, and `embedding`
- One embedding per property for this tutorial
- Clear embedding input recipe and dimension placeholder
- Enough fields to verify ranked search against requirements example queries

**Out of scope (do not model yet)**

- Multiple embedding versions / models per property
- User accounts, saved searches, permissions, RLS redesign
- Full-text keyword indexes as a replacement for vectors (optional later; hybrid tuning is out of scope per requirements §6)
- Production model keys, rate limits, or batch job infrastructure details
- Map search, price/beds filters, auth, payments, messaging, personalization

## Consistency checklist (must pass before migration)

- [ ] Every field has a clear purpose tied to requirements
- [ ] Primary key defined
- [ ] Embedding input text recipe is explicit
- [ ] Single dimension placeholder (`DIMENSION_TODO`) used consistently
- [ ] Raw text and vector are separate
- [ ] Null rules for embedding are stated
- [ ] Out-of-scope items are listed so the agent does not invent them later
- [ ] Seed intent covers requirements example queries (and near-miss control) without inventing filter columns

## Open questions

- Exact embedding model name and final dimension (fill in a later step; keep one choice end-to-end)
- Final similarity operator / distance metric in SQL (align with [`docs/vector-search-learner-notes.md`](vector-search-learner-notes.md); cosine is the working reminder until chosen)
- Default top-K for the first API (notes suggest trying K = 5)
- Whether `city` / `price` appear on the demo seed set for display realism (neither is required for embedding or ranking)
- How this tutorial entity maps onto existing `property_listings` (if at all) without pulling auth/RLS into the semantic-search slice

## Handoff

Next: plan Supabase pgvector enablement and migration order using this doc as the schema contract (`docs/pgvector-setup-plan.md`).
