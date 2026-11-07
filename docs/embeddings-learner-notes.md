# Embeddings learner notes (PREIshare)

Notes for the semantic-search tutorial slice. Check examples against
`docs/semantic-search-requirements.md` (especially section 3 example queries).

## Plain-language definition
An embedding is a list of numbers that stands for the *meaning* of a piece of text
(for us: a property description or a buyer’s search phrase). It is not a keyword
index and not a human-readable summary. Similar meanings produce similar number
lists; unrelated meanings produce lists that sit farther apart.

## Tiny intuition (not real model output)
Imagine a toy 3-number embedding just to picture “near” vs “far”:

- "lakefront cabin, quiet, strong Airbnb history" → [0.9, 0.8, 0.1]
- "waterfront cottage, peaceful, good short-term rental" → [0.88, 0.82, 0.12]  (nearby)
- "downtown loft near nightlife and offices" → [0.1, 0.2, 0.95]  (far from the cabin)

Real embeddings are much longer lists (often hundreds or thousands of numbers).
The idea is the same: similar meaning → similar number patterns.

## PREIshare examples from our requirements
- Buyer query I care about: “quiet cabin near water with good rental upside”
  (requirements example query #1)
- Listing A (should feel close to the query): “Rustic lake house with dock access;
  guests book most summer weekends through short-term rental platforms.”
  (Does not say “quiet,” “cabin,” or “upside” together—still matches the intent.)
- Listing B (should feel far): “Bright downtown condo steps from restaurants and
  nightlife; walk everywhere for work and dinner.”
- Why A is closer in meaning than B (in my words): The buyer wants calm water,
  a cabin-like feel, and rental income potential. Listing A is about a lake house
  and vacation bookings. Listing B is urban, busy, and walkable dining—closer to
  a different requirements query (“downtown condo walkable to restaurants”) than
  to this cabin/water/rental search. Shared words are not required; shared *idea*
  is what should pull A near the query and leave B farther away.

## Generation vs storage (do not mix these up)
| Stage | What happens | Where |
| --- | --- | --- |
| Generation | Text goes into an embedding model/API; a number-list comes back | App/code side (later: TypeScript module) |
| Storage | That number-list is saved with the property row | Database (later: Supabase PostgreSQL + pgvector) |

Search will later: embed the buyer’s query (generation) → compare to stored
property embeddings (storage + comparison). Ranking details are Step 3.

Keep one model and one list length (dimension) for both seed/backfill text and
live queries. Mixing formats breaks “near vs far” in ways that look like random
rankings.

## Misconceptions to watch for when reviewing agent code later
- Thinking embeddings store the original sentence as text inside the vector
- Assuming two listings must share the same words to be “close”
- Forgetting every embedding from the same model must use the same list length (dimensions)
- Mixing up “create embedding” with “INSERT into database”
- Believing a higher or lower single number in the list is a human-readable score by itself
- Letting farmland-style seed text dominate when the buyer asked for a cabin near water
  (requirements near-miss control: “productive farmland with irrigation”)

## What I can explain to a teammate in 60 seconds
Keyword search only wins when the listing uses the buyer’s exact words. An
embedding turns a property description or a search phrase into a long list of
numbers that stand for meaning, not spelling. Listings with similar meaning end
up with similar number lists even if the wording differs. We generate that list
in our app code, then store it next to the property in Postgres with pgvector.
When someone searches, we embed their query the same way and ask the database
which stored lists sit closest. That is how “quiet cabin near water with good
rental upside” can surface a lake house with strong vacation bookings that never
used those exact words.

## Open questions before similarity ranking (Step 3)
- How do we turn “closeness” into an ordered list of properties?
- What happens if two different embedding models are mixed in one table?
- Which distance / similarity metric will we use (for example cosine), and how
  do we read the score in a demo?
- Exact embedding provider and vector dimension still open in the requirements
  brief—once chosen, every helper and seed path must stay aligned with that choice.
- How many sample listings are enough so a near-miss control (farmland) ranks low
  while cabin / family / condo queries still look convincing?
