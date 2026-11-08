# PREIshare semantic search — handoff

This note is for the next owner of the beginner semantic-search slice.
Claims below come from the four source docs in section 9, the PREIshare client
story in the requirements brief, and the files those docs name. It does not
contain API keys, provider credentials, or connection strings.

## 1. Client story recap

PREIshare helps people discover investment properties. Keyword search falls
short when a buyer types an intent-heavy phrase such as “quiet cabin near water
with good rental upside.” Those words may never appear together in a listing,
yet the right homes are in the database.

This tutorial shipped a small, verifiable slice of that idea:

property text → embedding vector → pgvector storage → similarity ranking →
minimal API + search page.

An embedding is a fixed-length list of numbers that captures meaning. pgvector
stores those lists in Supabase PostgreSQL and finds rows whose vectors are
close to a query vector. Similarity ranking returns the closest listing first,
even when the listing never used the buyer’s exact words.

The skill this sprint was meant to build is judgment: explain why a result
ranked highly, and check that the pipeline is wired the same way from seed text
through search. The verification report is that check. A human still owns the
stakeholder demo.

## 2. Stakeholder goals ↔ deliverables

| Stakeholder goal | What we delivered | Where to look |
| --- | --- | --- |
| Search by meaning, not only exact words | App-side embedding of listing text and of the buyer query, then cosine similarity | `src/lib/embeddings/generate.ts`, `src/lib/property-search.ts` |
| Store vectors next to property data | pgvector enabled; sample listings live in `public.properties` with nullable `embedding vector(1536)` | `supabase/migrations/20250315000000_enable_pgvector_properties.sql` |
| Rankable matches for demo queries | `match_properties` orders by cosine distance and returns `1 - distance` as similarity | `supabase/migrations/20250315000001_match_properties_function.sql` |
| Something stakeholders can try | `POST /api/properties/search` and a search page that renders that response in server order | `src/routes/api/properties/search.ts`, `src/routes/search.tsx` |
| Proof it works on sample listings | 8 seeded listings and a recorded query pass | `data/sample-properties.json`, `scripts/seed-property-embeddings.ts`, `docs/semantic-search-verification.md` |

### What the verification pass showed

Checked 2026-11-07 against Supabase project `yixnhrotyolbriyirijf`. The page at
`http://localhost:3000/search` returned HTTP 200. Each query was
`POST /api/properties/search` with `{ "query": "..." }`. That session did not
type into the form in a browser. The page does not re-rank the helper’s order.

`EMBEDDING_MODEL` was unset, so the helper default `text-embedding-3-small`
was used. One stored vector was measured at 1536 numbers. All 8 sample rows
had descriptions and non-null embeddings. Scores below are cosine similarity
from `match_properties` (higher is closer). Top 3 of the default 5:

| # | Query (requirements §3) | Top results | Verdict in the report |
| --- | --- | --- | --- |
| 1 | quiet cabin near water with good rental upside | Pine-bay cabin 0.645; river cottage 0.583; turnkey duplex 0.524 | PARTIAL. Ranks 1–2 fit. The cottage matches without the words “cabin” or “upside.” Rank 3 is income only. Farmland was not in the top 3. |
| 2 | family-friendly home close to good schools | Schools home 0.656; walkable downtown condo 0.378; turnkey duplex 0.354 | PARTIAL. Rank 1 is the family house near elementary and middle schools, and the listing never says “family-friendly.” Ranks 2–3 are leftovers. |
| 3 | downtown condo walkable to restaurants | Walkable condo 0.775; late-night condo 0.630; warehouse loft 0.535 | YES. Rank 1 is the calm dining block. Rank 2 is a downtown condo that is nightlife. Rank 3 is a downtown loft. |
| 4 | productive farmland with irrigation | Irrigated cropland 0.644; duplex 0.271; schools home 0.249 | YES. Near-miss control. Cropland is the clear top hit and did not lead queries 1–3. |

Keyword-trap query (a paraphrase, not listing text): “hushed woodland lodge
beside a lake where visitors pay for a holiday.” None of those content words
appear in any sample title or description, so keyword search would return no
listing. Semantic search still ranked the pine-bay cabin (0.541) and the river
cottage (0.490) first. That is the demo that success criterion “meaning match
without exact keyword overlap” rests on.

All five requirements success criteria were marked met. Ready to demo: YES.
Say out loud that ranks after the first hit can be weak when only one listing
fits the intent. Do not re-run the seed script as written (section 6).

## 3. Architectural decisions

Values below are the ones this slice locked. The data-model doc left the model
name, final dimension, and SQL operator open; the setup plan and the
verification report closed them for the demo.

- **What text is embedded:** For a listing, `title`, a blank line, then `description`. The data model forbids embedding `price`, `id`, or `city`. The seed script sends only `title` and `description`. `city`, `state`, and `price` stay on the row for display. At query time the helper embeds the buyer’s text alone (it calls the same generator with an empty title, which is dropped) using the same model and dimension as the listings.
- **Embedding dimensions:** `1536`. The setup plan took the data-model stand-in `1536` and required that size on the column. `EMBEDDING_DIMENSIONS` in `src/lib/embeddings/types.ts` is 1536. `match_properties` takes `vector(1536)`. The verified model default is `text-embedding-3-small` when `EMBEDDING_MODEL` is unset. The generator asks `text-embedding-3*` models for 1536 dimensions.
- **Distance / similarity metric:** Cosine distance with pgvector `<=>`. Smaller distance is closer, so `match_properties` orders ascending by `<=>`. The score it returns, and the score the UI shows, is cosine similarity: `1 - distance`. Higher similarity is a better match. There is no similarity floor.
- **Top-K / match count:** `5`. That is the default argument of `match_properties` and of `searchPropertiesByText`. The API calls the helper with the query only, so the page always asks for 5. The verification report treats the weak 2nd and 3rd hits on the cabin and schools queries as that fixed 5 plus a thin sample, and left the helper unchanged.
- **Where embeddings are created:** App-side TypeScript, not inside Postgres. `generatePropertyEmbedding` in `src/lib/embeddings/generate.ts` calls an OpenAI-compatible embeddings HTTP API. The database stores the vector and ranks with `match_properties`. Seed and search both use that same function.
- **Which table holds the vectors:** `public.properties`, created by `20250315000000_enable_pgvector_properties.sql`. The verification report counted 8 rows there. The data-model handoff and the setup plan had resolved the mapping the other way: alter existing `property_listings`, add `embedding vector(1536)`, and do not create a parallel `properties` table. The shipped demo did not follow that mapping. Search, seed, and `match_properties` all read `public.properties`. Do not point a later change at `property_listings` unless a new requirements doc says to merge the two.
- **Index:** None. The setup plan kept a vector index out of the first migration. Sample-scale search is a sequential scan.
- **Who may call search:** `match_properties` is revoked from `public` and `anon`, and granted to `authenticated` and `service_role`. The search helper uses the service-role client because `anon` cannot execute the function. The setup plan said to leave owner RLS as-is and not redesign policies. This slice did not add a public SELECT policy for the demo.
- **Seed / backfill path:** `scripts/seed-property-embeddings.ts` reads `data/sample-properties.json`, embeds each listing, and inserts fixed ids into `public.properties`. It does not upsert. The verification report marked “seed script re-runnable” as FAIL: a second run would log duplicate-key errors and leave the current rows in place.

`state` is on the shipped table and in the sample JSON as display context, the same role the data model gave `city`. It is not a filter and it is not part of the seed embedding input.

## 4. In scope vs out of scope (this tutorial)

**In scope (done for the demo slice)**

- Sample properties with description text and stored embeddings (8 rows, 0 null embeddings, length 1536).
- One similarity search path: `match_properties` plus `searchPropertiesByText`.
- Minimal API (`POST /api/properties/search`) and the React search page at `/search`.
- Documented verification of the four requirements queries plus one keyword-trap paraphrase.
- Empty-query handling: the API returns HTTP 400 `{ "error": "Query is required", "results": [] }`; the page never calls the API for a blank field and shows “Type a description of the property you want.”

**Out of scope (explicit non-goals for this handoff)**

From requirements §6 and the verification limitations. Do not pull these into this search page unless a separate requirements doc owns them.

- Production embedding-provider billing, rate limits, batch jobs, or key rotation.
- Production auth, payments, messaging, or multi-tenant isolation. Search is server-side with the service role; the page itself has no auth.
- Map search.
- Filters (price, beds, location, property type) combined with vectors. `city`, `state`, and `price` are display fields only.
- Hybrid keyword + vector ranking, personalization, or any similarity floor. A cutoff was considered in the refine cycle and left out as ranking polish.
- Automatic re-embed when a listing changes, and an idempotent backfill. The seed script is a one-shot insert.
- Large evaluation sets, offline quality dashboards, or a CI job that calls the embedding API.

The refine cycle changed no code and no seed text. Top hit on every requirements query was the right demo listing. Weak later rows were written down as a sample-size limit.

## 5. Demo limitations (be honest)

- The sample is 8 listings. Odd later ranks usually mean thin coverage. The schools query has one convincing hit; the helper still returns five rows, so ranks 2 and 3 are the nearest leftovers (0.378 and 0.354 against a top score of 0.656).
- Nonsense tokens (`xqz flarp blorpt`) returned HTTP 200 and five rows. The best similarity was about 0.158. Nothing drops low scores.
- A one-word query such as “home” is stable and loosely ranked (top score 0.290 on the schools home).
- `EMBEDDING_API_KEY` must be set or generation fails. `EMBEDDING_MODEL` and `EMBEDDING_API_URL` are optional overrides. The verified run left `EMBEDDING_MODEL` unset. Without a key, seed and search cannot build vectors. The key value is not in this doc.
- This slice makes no claim about production latency, cost, or the full PREIshare catalog. It is a seeded sample on one project.
- Explainability is the similarity score plus title and description. There is no “why this matched” UI. The verification report’s own reading of the keyword trap is the explanation a beginner can give: the pine cabin wins because its embedding is about a wooded waterfront stay guests pay for, which the listing says as “quiet bay,” “cabin,” and “vacation-rental upside,” while the trap query shares no content words with that text.
- Proof of the page was an HTTP 200 and the JSON the Search button posts. A stakeholder click-through in the browser is still the human’s demo.

## 6. How to re-run the demo (handoff checklist)

1. Apply the two SQL files in this order. The setup plan forbids creating the vector column before the extension exists, and it forbids a second dimension or a second embedding column name.
   - `supabase/migrations/20250315000000_enable_pgvector_properties.sql` — `CREATE EXTENSION vector`, then `public.properties` with nullable `embedding vector(1536)`. No vector index.
   - `supabase/migrations/20250315000001_match_properties_function.sql` — `match_properties(query_embedding vector(1536), match_count int default 5)`.
   The repo docs do not name a migration CLI command. Use the Supabase SQL editor or the project’s existing migration path. The runnable table is `public.properties`, which is the table the verification report queried.
2. Configure env vars locally (names only; values stay in `.env`, never in git). See `.env.example` and the seed script header.
   - `SUPABASE_URL` (server). The seed script also accepts `VITE_SUPABASE_URL` as a fallback for that URL.
   - `SUPABASE_SERVICE_ROLE_KEY` — seed and search only. Never a `VITE_` name, never in browser code.
   - `EMBEDDING_API_KEY` — required to generate vectors.
   - Optional: `EMBEDDING_MODEL` (default `text-embedding-3-small`), `EMBEDDING_API_URL` (default `https://api.openai.com/v1/embeddings`).
   The setup plan’s example name `OPENAI_API_KEY` is not what this code reads.
3. Seed only when `public.properties` does not already contain these sample ids. From the repo root:

   ```bash
   npx tsx --env-file=.env scripts/seed-property-embeddings.ts
   ```

   Expect 8 inserts, each logged with 1536 dimensions. If the verification seed is already loaded, skip this step. A second run inserts the same ids, logs duplicate-key failures, and does not refresh embeddings.
4. Start the app with `npm run dev` and open `http://localhost:3000/search`.
5. Try the four queries in `docs/semantic-search-requirements.md` section 3, plus the keyword-trap sentence in section 2 of this handoff if you want the “keyword search would fail” demo.
6. Compare titles and the “best first” order with `docs/semantic-search-verification.md`. Scores will not match to three decimals if the model or the listing text changes. The top title for each requirements query should still be the pine-bay cabin, the schools home, the walkable downtown condo, and the irrigated cropland.

## 7. Next actions for later Sprint 5 work

Each item stays outside this tutorial until someone writes a requirements note for it. The verification report’s follow-ups are items 3 and the similarity-floor choice under item 2.

1. **Filters + vector search.** Add a structured constraint such as max price in the SQL function and the API, and still order the remaining rows by `<=>`. `price` is already stored and is not part of the embedding. Requirements §6 currently forbids price and beds filters on this page, so this needs its own brief. Do not embed the filter fields.
2. **Hybrid search.** Add a keyword or full-text signal beside cosine similarity and write down how the two scores combine. Today there is only `1 - (embedding <=> query)`. A minimum similarity was discussed in the refine cycle and explicitly not added; decide that in the open before hiding low scores.
3. **Re-embed on update.** When `title` or `description` changes, rebuild the canonical string (`title`, blank line, `description`) with the same model and 1536 dimensions, and store the new vector. Replace the seed’s insert-only loop with skip-or-upsert on `id` before anyone runs it again. Null embeddings are already excluded by `match_properties`.
4. **Grow the evaluation set.** The schools query has one convincing listing, which is why ranks 2 and 3 look wrong. Add listings that are real neighbors for each requirements query, keep the farmland row as the near-miss control, and freeze the query list plus the expected top title so a later change can be checked against `docs/semantic-search-verification.md`.
5. **CI considerations.** Safe to automate later: migration SQL still enables `vector` before the column, the column stays `vector(1536)`, and helper tests that do not call the network (empty input, dimension check, canonical text). Leave live embedding calls and seed inserts manual. They spend provider quota and the current seed is not idempotent.
6. **Observability.** For a bad ranking, log the query text, the latency of embed plus `match_properties`, and the top titles with similarity. Keep listing text and buyer queries out of client logs that leave the machine. Do not log `EMBEDDING_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY`.

## 8. Open questions for mentor / next owner

- The demo lock is `text-embedding-3-small` at 1536 only because `EMBEDDING_MODEL` was unset and the column was already `vector(1536)`. Confirm whether production stays on that pair. Query vectors and stored vectors have to stay on one model and one dimension; the requirements brief says mixed sizes break insert or search.
- Cosine via `<=>`, with similarity reported as `1 - distance`, is the tutorial standard in the setup plan and in `match_properties`. Confirm that PREIshare will keep that operator app-wide before any second search path chooses a different one.
- Who owns embedding cost, quota, and rotation of `EMBEDDING_API_KEY`? This tutorial left billing and rate limits out of scope.
- Which filter, if any, is the next stakeholder demo: max price, beds, or city? The current page accepts one text query. The verification report says not to add filters until a separate requirements doc owns that work.
- Does the next sprint keep `public.properties`, or fold this slice into `property_listings` as the setup plan originally required? Pick one table before writing more SQL. The seeded demo and the verification numbers are on `public.properties`.

## 9. Sources used for this handoff

- `docs/semantic-search-requirements.md` — client story, example queries, success criteria, in-scope and out-of-scope lists
- `docs/embedding-data-model.md` — canonical embedding string, dimension stand-in, cosine reminder, top-K of 5, and the earlier `property_listings` mapping
- `docs/pgvector-setup-plan.md` — extension-then-column order, `vector(1536)`, `<=>`, no index in the first migration, env names
- `docs/semantic-search-verification.md` — 2026-11-07 results, keyword trap, seed re-run failure, and the demo sign-off

Files those docs point at, used to record what shipped: `supabase/migrations/20250315000000_enable_pgvector_properties.sql`, `supabase/migrations/20250315000001_match_properties_function.sql`, `src/lib/embeddings/generate.ts`, `src/lib/embeddings/types.ts`, `src/lib/property-search.ts`, `src/routes/api/properties/search.ts`, `src/routes/search.tsx`, `scripts/seed-property-embeddings.ts`, `data/sample-properties.json`.
