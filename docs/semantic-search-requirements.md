# PREIshare Semantic Search — Requirements Brief

This file is the contract for a beginner-friendly semantic search tutorial slice
on PREIshare. It is written so a learner can direct a coding agent, review what
comes back, and check work against clear success criteria. It does not contain
real API keys, provider credentials, or connection strings.

Every later implementation step should be checkable against the **example
queries** and **success criteria** below. If a prompt would add out-of-scope
work, cut it.

---

## Tutorial framing (who you are in this sprint)

PREIshare helps people discover investment properties, but keyword search falls
short when a buyer types something like “quiet cabin near water with good rental
upside.” Those words may never appear exactly in a listing, yet the right homes
are in the database.

In this tutorial you will learn how semantic search works at a beginner-friendly
level: turning property descriptions into **embeddings** (lists of numbers that
capture meaning), storing them in Supabase PostgreSQL with the **pgvector**
extension, and ranking results by **similarity** so PREIshare can return
properties that match intent—not just exact phrases.

You will not type every line of code by hand. Your job is to think like a
director: understand the problem, design a simple data model, write clear
prompts for a coding agent, and carefully review what comes back. We use
TypeScript, TanStack Start, React, and Supabase—but every technical term is
introduced in plain language the first time you see it.

By the end you will have a small, verifiable slice of PREIshare semantic search:
sample properties with stored vectors, a similarity query, and a basic search
experience you can demonstrate to stakeholders. Expect multiple
prompt → review → refine cycles. Semantic search is powerful, but only if you
can explain why a result ranked highly and verify that the pipeline
(text → embedding → store → search) is wired correctly. That judgment is the
skill this sprint builds.

---

## 1. Problem

PREIshare buyers discover investment properties by describing lifestyle and
investment intent in everyday language. Keyword search only matches exact words
in listing text, so queries like “quiet cabin near water with good rental
upside” miss strong matches when those words never appear together. This
tutorial will add a small semantic search slice: turn property descriptions into
meaning-aware vectors, store them in Supabase PostgreSQL with pgvector, and rank
sample listings by similarity.

Three ideas matter for every later step:

- An **embedding** is a list of numbers that represents the meaning of a piece
  of text (for example, a property description or a buyer’s query). Similar
  meanings produce similar lists.
- **pgvector** is a PostgreSQL extension that stores those lists and can find
  rows whose vectors are “close” to a query vector.
- **Similarity search** ranks listings by how close their embeddings are to the
  query embedding—best match first—even when the listing never used the buyer’s
  exact words.

---

## 2. Actors

| Actor | Goal |
| --- | --- |
| Property buyer / investor | Find listings that match intent, not only exact phrases |
| PREIshare operator (us) | Demo trustworthy semantic matches on sample data and hand off cleanly |
| Coding agent (assistant) | Produce migrations, embedding helpers, and UI only inside the stated scope |

---

## 3. Example queries (must drive later tests)

Use these queries when designing seed data, writing verification notes, and
reviewing agent output. For each query, a *good* top result is described in
plain language (no SQL yet).

| # | Query | What a good top result looks like |
| --- | --- | --- |
| 1 | “quiet cabin near water with good rental upside” | A rustic or cabin-style property near a lake, river, or shore, with language about vacation or rental potential—even if the listing never says “quiet,” “cabin,” and “upside” together |
| 2 | “family-friendly home close to good schools” | A residential home (or similar) whose description emphasizes family living, neighborhood, or nearby schools—without requiring the exact phrase “family-friendly” |
| 3 | “downtown condo walkable to restaurants” | An urban condo or apartment whose description suggests walkability, dining, or a city-center location—even if it never uses the word “walkable” |
| 4 | Near-miss control (e.g. “productive farmland with irrigation”) | Should *not* dominate results when sample listings are cabins, family homes, and condos; farmland-style matches should rank low or be absent |

When reviewing results later, ask: would a beginner agree this listing fits the
buyer’s intent? If the top hit only matched a single shared keyword and ignored
the rest of the meaning, treat that as a failed demo until seed text or the
pipeline is fixed.

---

## 4. Success criteria (observable)

- [ ] Sample properties exist with description text and stored embedding vectors
- [ ] A similarity search returns a ranked list (best match first) for a
      natural-language query
- [ ] At least one demo query returns a relevant property even when key query
      words are missing from the listing text
- [ ] A beginner can explain why keyword search would fail on that same query
- [ ] In-scope vs out-of-scope boundaries are respected in code and docs
      produced later

---

## 5. In scope for this tutorial

- Plain-language understanding of embeddings and vector similarity
- Data model for properties + embedding vectors suitable for Supabase + pgvector
- Migration to enable pgvector and store vectors
- TypeScript helper to generate embeddings for property text
- Seed/backfill path for a small sample set
- Similarity search SQL + TypeScript helper
- Minimal API route and simple React search page in TanStack Start
- End-to-end verification notes and handoff doc

---

## 6. Out of scope (explicit non-goals)

- Production embedding provider billing, rate-limit ops, or batch jobs at scale
- Map search, filters (price, beds), auth, payments, or messaging
- Advanced ranking (personalization, business rules, hybrid keyword+vector
  tuning beyond a basic demo)
- Perfect design polish or mobile app work

Do not expand the tutorial into sponsor auth, RLS policy redesign, or investor
dashboard polish unless a separate requirements doc already owns that work.

---

## 7. Assumptions and open questions

**Assumptions**

- Free-tier Supabase is enough for sample data.
- Embedding model and vector dimension will be decided in the data-model step
  and must stay consistent end-to-end (same model for seed text and for queries).

**Open questions to resolve later**

- Exact embedding provider (which API or local path generates vectors)
- Vector dimension (length of each embedding list)
- Distance / similarity metric (for example cosine distance)
- How many sample listings are enough for a convincing demo

Until those are decided, agents should not invent a second embedding format or
swap dimensions mid-pipeline. Document the choice in the data-model step and
keep every helper aligned with it.

---

## 8. How later steps use this brief

This file is the contract for the data model, pgvector migration, embedding
helpers, seed/backfill, similarity query, minimal search UI, and the
verification / handoff docs that follow.

When reviewing agent output, check it against sections **3**, **4**, **5**,
and **6** before keeping a migration, helper, or route:

- Sample rows have both readable description text and stored vectors.
- Search returns an ordered list for at least the example queries above.
- At least one demo shows meaning match without exact keyword overlap.
- Nothing from section 6 (filters, auth, billing ops, advanced ranking) sneaks
  into the tutorial slice.

**Handoff note:** every implementation step should remain checkable against the
example queries and success criteria. If a prompt would add out-of-scope work,
cut it.
