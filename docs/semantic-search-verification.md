# Semantic search verification report (PREIshare)

## Scope checked
- Requirements source: `docs/semantic-search-requirements.md`
- UI: `src/routes/search.tsx`
- API: `src/routes/api/properties/search.ts`
- Search helper: `src/lib/property-search.ts`
- Seed inputs: `data/sample-properties.json`, `scripts/seed-property-embeddings.ts`

## Environment
- Date tested: 2026-11-07 (local evening; dev server log in UTC was 2026-11-08)
- Supabase project (name or ref only, no secrets): `yixnhrotyolbriyirijf`
- App run method (e.g. local dev server): `npm run dev` (Vite) at `http://localhost:3000/search`. The page returned HTTP 200 and included the search form. Each query below was sent as `POST /api/properties/search` with `{ "query": "..." }`, which is the request the Search button sends. The page renders that response in server order and does not re-rank it. This session had no interactive browser, so the form was not typed into by hand.
- Embedding model / dimension expected: `EMBEDDING_MODEL` is unset, so the helper default is `text-embedding-3-small`. Code and the `embedding vector(1536)` column expect 1536 dimensions. One stored vector was measured at 1536 numbers. `EMBEDDING_API_KEY` is set locally and was not recorded here.

## Data checks
| Check | Result | Notes |
| --- | --- | --- |
| Sample properties present | PASS | row count: 8 in `public.properties`, matching 8 entries in `data/sample-properties.json`. Titles include the pine-bay cabin, the river cottage, the schools home, both downtown condos, the loft, the duplex, and the irrigated cropland. |
| Embeddings non-null for all samples | PASS | null count: 0. All 8 rows have an embedding. `match_properties` also skips null embeddings. |
| Seed script re-runnable without breaking search | FAIL | Not executed again (a second run would call the embedding provider and attempt another insert). `scripts/seed-property-embeddings.ts` inserts fixed ids and does not upsert. A re-run would log duplicate-key failures per row and leave the current rows in place, so search data should survive, but the script is not a safe re-seed. |

## Query results (semantic)
Scores are cosine similarity from `match_properties` (higher is closer). Top 3 of the default 5.

| # | Query | Top 3 results (title or id) | Sensible neighbors? | Notes |
| --- | --- | --- | --- | --- |
| 1 | quiet cabin near water with good rental upside | 1. Secluded pine cabin on a quiet bay (0.645). 2. Rustic river cottage with kayak access and booking demand (0.583). 3. Turnkey duplex with strong cash-flow history (0.524) | PARTIAL | Ranks 1–2 match a quiet waterfront place with rental demand. The cottage does that without the words “cabin” or “upside.” Rank 3 is income only, not a cabin near water. Farmland was not in the top 3. |
| 2 | family-friendly home close to good schools | 1. Spacious four-bedroom home near top-rated schools (0.656). 2. Walkable downtown condo near restaurants and shops (0.378). 3. Turnkey duplex with strong cash-flow history (0.354) | PARTIAL | Rank 1 is the family house near elementary and middle schools, and the listing never says “family-friendly.” Ranks 2–3 are not family or school neighbors. The score drop (0.656 to 0.378) shows they are leftovers in a set that has only one home like this. |
| 3 | downtown condo walkable to restaurants | 1. Walkable downtown condo near restaurants and shops (0.775). 2. Corner condo above bars and late-night venues (0.630). 3. Sunlit warehouse loft steps from downtown transit (0.535) | YES | Rank 1 is the calm walkable dining block. Rank 2 is a downtown condo with restaurants, but it is nightlife and noise. Rank 3 is a downtown loft a short walk from coffee shops. |
| 4 | productive farmland with irrigation | 1. Irrigated cropland parcel with productive soils (0.644). 2. Turnkey duplex with strong cash-flow history (0.271). 3. Spacious four-bedroom home near top-rated schools (0.249) | YES | Near-miss control. Cropland is the clear top hit. The next scores are far lower and are not farmland. This listing did not lead the cabin, family-home, or condo queries. |

## Keyword-trap check
- Trap query (paraphrase, not exact listing text): `hushed woodland lodge beside a lake where visitors pay for a holiday`
- Expected kind of property: a quiet wooded place on the water where guests pay to stay (the pine-bay cabin and the river cottage)
- Actual top results: 1. Secluded pine cabin on a quiet bay (0.541). 2. Rustic river cottage with kayak access and booking demand (0.490). 3. Spacious four-bedroom home near top-rated schools (0.311)
- Did semantic search beat exact-keyword matching? YES
- Evidence (one sentence): None of the content words hushed, woodland, lodge, beside, lake, visitors, pay, or holiday appear in any sample title or description, so a keyword match returns no listing, while semantic search still ranked the two waterfront getaways first.

## Safety / edge cases
| Case | Expected | Actual | PASS / FAIL |
| --- | --- | --- | --- |
| Empty query | Clear error or empty list, no crash | `POST` with `""` and with whitespace only returned HTTP 400 `{ "error": "Query is required", "results": [] }`. The page never calls the API for a blank field; it shows “Type a description of the property you want.” | PASS |
| Nonsense tokens | Low similarity or empty, no crash | `xqz flarp blorpt` returned HTTP 200 and 5 rows. Top similarity was 0.158 (Irrigated cropland parcel with productive soils). No crash. There is no minimum-score cutoff, so low matches are still listed. | PASS |
| Very short query | Stable response | `home` returned HTTP 200 and 5 ranked rows. Top was Spacious four-bedroom home near top-rated schools (0.290), then the pine cabin (0.242) and the late-night condo (0.231). | PASS |

## Refine cycle (required)
- Failing or weak example (query + bad ranking or error): “family-friendly home close to good schools.” Rank 1 is right. Ranks 2 and 3 (walkable downtown condo at 0.378, turnkey duplex at 0.354) are not homes near schools. The same pattern shows up on the cabin query, where the duplex is rank 3 at 0.524 because the helper always asks for 5 nearest rows.
- Suspected layer (seed data / embedding text / SQL distance / helper / API / UI): Seed data plus helper. The sample set has only one family-and-schools listing, and `searchPropertiesByText` calls `match_properties` with `match_count` 5 and no similarity floor. SQL order itself is fine: best cosine similarity first. The UI prints every returned row.
- Change made (files touched): None. A similarity cutoff or extra “hide weak neighbors” UI would be ranking polish beyond this tutorial slice.
- Re-test result: Not re-tested. No code or seed text was changed in this pass. The four requirement queries and the keyword-trap query were left as recorded above.
- Keep or revert decision: Keep. The top hit on every requirement query is the right demo. Weak later rows are a sample-size limitation, documented below, not a broken pipeline.

## Requirements traceability
| Requirement / success criterion | Met? | Evidence |
| --- | --- | --- |
| Sample properties exist with description text and stored embedding vectors | YES | 8 rows, descriptions present, 0 null embeddings, stored length 1536. |
| A similarity search returns a ranked list (best match first) for a natural-language query | YES | `match_properties` orders by cosine distance and returns `1 - distance`. Every live query above came back with similarity descending. |
| At least one demo query returns a relevant property even when key query words are missing from the listing text | YES | Keyword-trap query. The pine cabin and river cottage ranked 1 and 2 with no shared content words. |
| A beginner can explain why keyword search would fail on that same query | YES | Keyword overlap on the trap query is empty for every sample listing. The cabin still wins because the embedding is about a wooded waterfront stay guests pay for, which the listing says as “quiet bay,” “cabin,” and “vacation-rental upside.” |
| In-scope vs out-of-scope boundaries are respected in code and docs produced later | YES | The page and API accept one text query and render the helper’s order. This slice does not add price or bed filters, auth, payments, map search, or a hybrid ranker. |

## Remaining limitations (honest handoff)
- What this tutorial slice does **not** do yet (filters, auth, production embedding jobs, etc.): No map, no price or bedroom filters, no auth on the search page, no payments, no messaging, and no production embedding batch or rate-limit handling. Search uses the service-role client on the server because `match_properties` is not granted to `anon`. The seed script is a one-shot insert, not an idempotent backfill.
- Known ranking weaknesses on the sample set: Later ranks are often the nearest leftover, not a good neighbor. The family-home query has only one convincing hit. Nonsense tokens still return five rows at about 0.13–0.16 similarity because nothing drops low scores. A one-word query such as “home” is stable but loosely ranked.
- Follow-ups for the next topic: Teach the handoff from this report. If someone extends the slice, make the seed script skip or upsert existing ids before running it again, and decide explicitly before adding a similarity floor (that choice is outside the current demo). Do not pull filters, auth, or billing into this search page unless a separate requirements doc owns that work.

## Sign-off
- Verified by: Agent-assisted check against the local dev server and `public.properties` on project `yixnhrotyolbriyirijf`. Human review still owns the stakeholder demo.
- Ready to demo to a stakeholder? YES
- Blockers before demo: None for showing the seeded sample. Do not re-run `scripts/seed-property-embeddings.ts` as it is written; duplicate inserts will fail. Say out loud that ranks after the first hit can be weak when only one listing fits the intent.
