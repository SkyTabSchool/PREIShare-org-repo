# ADR-001: Shared investor listing types

**Status:** Proposed (first-pass draft for product-partner review)

**Date:** 2026-09-19

**Audience:** PREIshare product partners and teammates who need the “why,” not the TypeScript syntax.

An **ADR** (architecture decision record) is a short, durable note: what we decided, why, and what we are not doing yet. This one records how we describe an investor listing in code so later screens, APIs, and the database all mean the same thing.

---

## Attached source material (do not invent fields from memory)

This draft is a reading of existing PREIshare documents and the public type barrel. If this ADR and a source disagree, the **domain brief** wins on business meaning; update this ADR after the team confirms.

| Attachment | Path | What to take from it |
| --- | --- | --- |
| Domain brief | [docs/domain/investor-listing-domain-brief.md](../domain/investor-listing-domain-brief.md) | What a listing is, who uses it, allowed status and property-type words, nested groups, and the “valid listing” bar |
| Field inventory | [docs/domain/listing-field-inventory.md](../domain/listing-field-inventory.md) | Required vs optional fields, shapes (text / number / nested), and closed lists |
| Expected type errors | [docs/type-safety/expected-type-errors.md](../type-safety/expected-type-errors.md) | Nine bad examples the types must refuse before the app runs |
| Verification checklist | [docs/type-safety/verification-checklist.md](../type-safety/verification-checklist.md) | How we prove coverage, fixtures, and the everyday typecheck command |
| Public type exports | [src/types/index.ts](../../src/types/index.ts) | The names other code is allowed to import |

Do not paste private investor data into this file. Examples in fixtures are fictional.

### Attachment A — Domain brief (summary)

PREIshare helps investors decide more intelligently. An **investor listing** is a property opportunity the team stores and shows. Loose objects let bugs reach production: a missing price, a status spelled three ways, or an address field that is on one screen and gone on another.

**Actors:** listing editor (internal ops), investor (end user), reviewer / compliance, and future systems (website, API, database) that must share one shape.

**Lifecycle statuses (exact words only):** `draft`, `published`, `under_offer`, `sold`, `archived`. Not `LIVE`, `Active`, `pending`, or `under_contract`. Typical path: `draft` → `published` → `under_offer` → `sold`, with `archived` as the off-browse end state.

**Property types (exact words only):** `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, `land`. Not `multi_family`, `house`, or `commercial`.

**Nested groups that must stay grouped (not one blob of text):**

- **Address** — street, city, region/state, postal code, country together
- **Financial summary** — numeric asking price plus currency; optional return metrics
- **Investor contacts** — people with a name and at least one reachable channel (email or phone)
- **Ownership** — closed relationship (`primary_owner`, `co_owner`, `broker`); share is optional

A listing investors can see needs items 1–7 of the brief (id, title, allowed status and property type, locatable address, numeric price + currency, at least one reachable contact, closed ownership relationship). Drafts may still be incomplete while an editor works. Reviewer / compliance does not publish until that bar holds.

### Attachment B — Field inventory (summary)

**Always required:** `id`, `title`, `status`, `propertyType`, `createdAt`, `updatedAt`.

**Required when status is `published`, `under_offer`, or `sold`:** `description`; address `line1`, `city`, `region`, `postalCode`, `country`; `financials.askingPrice` (a number, not `"$12,500,000"`) and `financials.currency`; at least one contact.

**Always optional:** `address.line2`; `financials.projectedIrrPercent`; `financials.capRatePercent`; ownership `sharePercent`.

**Contacts (each row):** `name` and `role` required; at least one of `email` or `phone`. Role is why they appear (for example `broker` or `owner_rep`). It is not the ownership-relationship list.

**Ownership (inventory as a list of rows):** which contact the row refers to; relationship from the closed list; optional numeric share.

Inventory rule: do not invent extra top-level groups beyond identity, address, financials, contacts, and ownership without updating the brief.

### Attachment C — Expected type errors (summary)

`src/fixtures/invalid-listings.errors.ts` holds nine objects that *look* like listings but break a business rule on purpose. Do not “fix” them. They prove the types refuse bad data **before the app runs**. Everyday `npm run typecheck` skips that file so a clean check can pass. To see the live errors: `npx tsc --noEmit`.

| Export | What is wrong in business terms | Kind of refusal |
| --- | --- | --- |
| `invalidStatusLive` | Status is `LIVE` instead of an allowed lifecycle word | Wrong allowed word |
| `invalidPropertyTypeHouse` | Asset class is `house` | Wrong allowed word |
| `invalidFlattenedAddress` | Address is one string instead of street / city / region / postal / country | Text vs nested address |
| `invalidAskingPriceString` | Asking price is `"$12,500,000"` | Number vs formatted money text |
| `invalidContactNoChannel` | Contact has a name and role but no email or phone | Missing reachable channel |
| `invalidEmptyContacts` | A published listing has nobody to reach (`[]`) | Empty list; needs at least one contact |
| `invalidOwnershipRelationship` | Ownership is `"majority investor"` | Wrong allowed word |
| `invalidSoldMissingClosedAt` | A sold listing has no close date | Missing `closedAt` |
| `invalidDraftWithClosedAt` | A draft carries a close date it should not have | Extra field not allowed on this status |

### Attachment D — Verification checklist (highlights)

Before review, we need evidence that:

- Required inventory fields appear on the listing type or a nested type it uses
- Status and property-type lists match the brief (no free-form strings)
- Address, financials, contacts, and ownership relationships match the domain
- Public names are exported from `src/types/index.ts`
- A sold listing requires `closedAt`; other statuses must not carry it
- `id`, `createdAt`, and `updatedAt` are treated as stable / not a business key (`readonly` on the shared listing base)
- Five fictional sample listings typecheck cleanly; the nine invalid exports still fail
- `npm run typecheck` succeeds for valid sources and excludes the intentional-error file

### Attachment E — What `src/types/index.ts` exports

Other app code should import from `@/types` (this barrel), not from scattered internal files unless a later decision says otherwise. The barrel currently re-exports:

- Nested groups: `Address`, `FinancialSummary`, `InvestorContact`, `Ownership`, `OwnershipRelationship`
- Listing shapes: `InvestorListing`, `InvestorListingBase`, `ClosedInvestorListing` (sold), `OpenInvestorListing` (every status except sold)
- Closed word lists: `ListingStatus`, `PropertyType`

---

## Status

**Proposed.** Types and fixtures already exist in the repo. This ADR is the first written product-facing record of *why* those types look this way. It is not accepted until a product partner and a reviewer confirm the decisions below—especially where the types are stricter than the draft-incomplete rule, and where ownership is one row instead of a list.

---

## Context

Today, teammates can describe the same opportunity with different field names, different status spellings, or a flattened address. That is how a city, a postal code, or a contact disappears on a later screen. Reviewer / compliance cannot trust a published card with no asking price or nobody to call.

We need one shared definition of a listing across screens. A **type** is a label that says what kind of data the code expects. **Compile time** is the check that happens before the app runs. The goal is to catch missing or invalid listing data at that check—not in production, and not only after an investor notices.

This is not a UI, API, or database design. It is the contract those later pieces must honor.

---

## Decision

We adopt a single shared listing model in `src/types/`, named `InvestorListing`, that honors the domain brief and field inventory:

1. Identity fields live on the listing itself: stable `id`, title, description, property type, status, and created/updated timestamps.
2. Address, financials, contacts, and ownership stay nested. We do not flatten them into one string or scatter their parts across the listing root.
3. Status, property type, and ownership relationship are **closed lists**—only the agreed words. Teammates cannot type a near-synonym and have it count as valid.
4. Asking price is a **number**. Currency lives in its own field. Formatted money text is for display later, not storage in this model.
5. Each contact is a person with a name, a role, and at least one of email or phone. A listing that is meant to be complete has at least one such contact (an empty list is not allowed).
6. When status is `sold`, a close date (`closedAt`) is required. When status is anything else, that date must not be present. This is the extra rule the invalid fixtures prove, beyond the original inventory tables.
7. Everyday `npm run typecheck` must pass on real app sources and the *valid* sample listings. The *invalid* fixtures stay broken on purpose and are excluded from that everyday command.

Where the implemented types already go slightly beyond the inventory (contact `id`, `primaryContactId`, single ownership row, `closedAt`, required nested groups even on drafts), this ADR records those as current decisions so a product partner can accept or send them back. See **Type choices mapped to business rules** and **Follow-ups**.

---

## Type choices mapped to business rules

Plain language first; the type name is only a handle for the code.

| Business rule | What the type does | Why a product partner should care |
| --- | --- | --- |
| A listing has a stable id and timestamps | `id`, `createdAt`, `updatedAt` are required text, and marked so they are not casually overwritten | Search, history, and “which card is this?” stay reliable |
| Title and description are investor-facing copy | Required text on the shared listing shape | Cards and detail pages have something to show |
| Status is one of five lifecycle words | `ListingStatus` allows only `draft`, `published`, `under_offer`, `sold`, `archived` | Filters and review queues do not split into `LIVE` vs `published` |
| Property type is one of six asset classes | `PropertyType` allows only `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, `land` | Browse and reports group the same way every time |
| Street, city, region, postal code, and country travel together | Nested `Address` (`line1`, `city`, `region`, `postalCode`, `country`; optional `line2`) | A later screen can show city or ZIP without losing the rest |
| Published-quality listings have a numeric asking price and a currency | Nested `FinancialSummary` with `askingPrice` as a number and `currency` as text (example `USD`) | Sorting and comparing price works; `"$12,500,000"` cannot sneak in as the stored amount |
| Return metrics may wait | `projectedIrrPercent` and `capRatePercent` may be absent | Ops can publish without inventing IRR/cap rate |
| Someone reachable is on the listing | `contacts` must contain at least one person; each person needs email and/or phone | Reviewer / compliance knows who to call; investors are not looking at an orphan card |
| Role vs ownership are different ideas | Contact `role` is ordinary text (why they appear). Ownership `relationship` is only `primary_owner`, `co_owner`, or `broker` | We can filter owners vs brokers without reading sentences like “majority investor” |
| Ownership share is optional | `sharePercent` may be absent; if present it is a number | Co-ownership can be recorded later without blocking the listing |
| Sold deals need a close date; drafts must not pretend they closed | `InvestorListing` requires `closedAt` only when status is `sold` | History and “when did this leave the market?” work; a draft cannot carry leftover close dates |
| We can talk about “sold” vs “still open” listings | `ClosedInvestorListing` and `OpenInvestorListing` are nicknames for those two cases | Later screens can require a close date only on the sold path |

**Current implementation notes (product-visible, not hidden engineering):**

- The types also require a contact `id` and a `primaryContactId` so ownership and “who to call first” point at a person, not a typed name that might be misspelled.
- The types model **one** ownership row (`Ownership`), not the inventory’s list of rows. That is stricter and simpler for Sprint 2. If product needs several owners on one listing, that is a follow-up.
- The types currently require a complete address, financials, description, and at least one contact **even on drafts**. The domain brief allowed incomplete drafts. That is a known tightening; see **Follow-ups**.

---

## Alternatives considered

**Keep loose objects / ad-hoc JSON.** Fastest to type. Rejected because missing price, alias statuses, and flattened addresses already match the production bugs the brief exists to stop.

**One giant form with every field as optional text.** Easy for an editor who is still filling a draft. Rejected for published+ listings: optional text cannot stop `"$12,500,000"` as a price or `LIVE` as a status.

**Flatten address and contacts into a few strings.** Fewer boxes on a form. Rejected because city, postal code, and a reachable person then disappear on the next screen.

**Allow any status or property-type string, and “clean it up later.”** Rejected. The brief says if a type allows a status or field not listed there, the type is wrong.

**Two separate models: a messy draft and a strict published listing.** Matches the brief’s “drafts may be incomplete” line more closely. Not chosen for this first pass because it doubles the shapes every screen must understand. We may still do this later (see **Follow-ups**).

**Runtime-only checks (validate when someone clicks Save, not before the app runs).** Necessary eventually for forms and APIs. Not a substitute for this decision: if code can *construct* an invalid listing and pass it around, screens will still disagree.

---

## Consequences

**Good**

- Listing editors, reviewers, and later UI/API/database work share one vocabulary.
- The nine invalid fixtures stay as living proof: alias status, wrong property type, flattened address, money-as-text, unreachable contact, empty contact list, free-text ownership, sold without a close date, and draft with a close date are all refused.
- Valid fictional samples (draft, published, under_offer, sold, archived) show what “good” looks like without using private investor data.
- Everyday typecheck can stay green while the teaching fixtures still fail under the full project check.

**Tradeoffs / costs**

- Internal ops must use the five status words and six property-type words. Marketing labels like `LIVE` will not typecheck.
- Complete nested address and a numeric price are required in the current types even while a listing is still a draft. Editors may need placeholder values, or we later split draft vs published shapes.
- One ownership row cannot yet describe several co-owners with different shares.
- Currency is free text in the type (example `USD`), not a closed list. Wrong codes are not caught the same way as wrong statuses.
- `closedAt` is a type rule that the original inventory tables did not list. Product should confirm that sold history always has a close date.

**What does not change yet**

- No investor-facing screens, save APIs, or database tables are implied by accepting this ADR.
- Runtime validation (forms, APIs) remains a later concern. These labels stop bad *shapes in code*; they do not by themselves stop a badly filled web form.

---

## Out of scope for Sprint 2 Topic 1

- Database tables, migrations, or Supabase row types
- HTTP API routes and request/response validation at runtime
- React form components and client-side validation UX
- Authentication, authorization, and multi-tenant rules
- pgvector / search indexing fields beyond what the current listing model already includes
- Changing production data or deploying a service

---

## Follow-ups

1. **Product partner sign-off** on this Proposed ADR—especially incomplete drafts vs always-complete types, one ownership row vs a list, and required `closedAt` on sold.
2. If drafts must be savable while incomplete, introduce a separate incomplete-draft shape (or clearly optional nested groups) without weakening published / under_offer / sold.
3. If a listing can have several owners, change `ownership` to a list and keep the closed relationship words.
4. Decide whether `currency` becomes a small closed list (for example `USD`) once the team agrees which codes we support.
5. Wire later UI, API, and database work to this contract; do not invent a parallel listing shape.
6. Keep [docs/type-safety/verification-checklist.md](../type-safety/verification-checklist.md) as the review gate; re-run `npm run typecheck` after any type change, and confirm the nine invalid fixtures still fail with `npx tsc --noEmit`.
7. After acceptance, change **Status** at the top of this file from Proposed to Accepted (and date it).

---

## How a partner can verify without reading TypeScript

1. Read the domain brief and this Decision section. They should tell the same story.
2. Confirm the five statuses and six property types above match how ops actually talks.
3. Ask an engineer to run `npm run typecheck` (should finish with no error messages) and `npx tsc --noEmit` (should still report the nine intentional mistakes). Do not ask anyone to “fix” the invalid fixture file.

