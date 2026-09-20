# Sprint 2 Topic 1 — Types Handoff: PREIshare Investor Listings

**Audience:** next sprint topic owners, PREIshare eng, product partners  
**Status:** Topic 1 (TypeScript foundations) complete — implementation topics not started  
**Date:** 2026-09-19

This is a **bridge** from Topic 1 into later work. It does not replace [ADR-001](../decisions/ADR-001-investor-listing-types.md). If this file and the types disagree, trust `src/types/` and the domain brief, then update the ADR.

---

## Attached contract (do not invent fields or statuses)

| Source | Path | What it is |
| --- | --- | --- |
| Domain brief | [`docs/domain/investor-listing-domain-brief.md`](../domain/investor-listing-domain-brief.md) | What a listing is; allowed status and property-type words |
| Field inventory | [`docs/domain/listing-field-inventory.md`](../domain/listing-field-inventory.md) | Required vs optional fields |
| ADR-001 | [`docs/decisions/ADR-001-investor-listing-types.md`](../decisions/ADR-001-investor-listing-types.md) | Why the types look this way (Proposed) |
| Type barrel | [`src/types/index.ts`](../../src/types/index.ts) | Only public import surface |
| Valid fixtures | [`src/fixtures/sample-investor-listings.ts`](../../src/fixtures/sample-investor-listings.ts) | Five fictional listings that typecheck |
| Invalid fixtures | [`src/fixtures/invalid-listings.errors.ts`](../../src/fixtures/invalid-listings.errors.ts) | Nine objects that must stay broken |
| Expected errors | [`docs/type-safety/expected-type-errors.md`](../type-safety/expected-type-errors.md) | Human map of those nine refusals |
| Verification | [`docs/type-safety/verification-checklist.md`](../type-safety/verification-checklist.md) | Review gate |

### Closed lists (exact words)

From `src/types/listing-status.ts`:

```ts
export type ListingStatus =
  | "draft"
  | "published"
  | "under_offer"
  | "sold"
  | "archived";
```

From `src/types/property-type.ts`:

```ts
export type PropertyType =
  | "multifamily"
  | "office"
  | "retail"
  | "industrial"
  | "mixed_use"
  | "land";
```

From `src/types/ownership.ts`:

```ts
export type OwnershipRelationship =
  | "primary_owner"
  | "co_owner"
  | "broker";
```

### Public exports (`src/types/index.ts`)

Import from `@/types` (this barrel), not from internal files unless a later decision says otherwise:

- Nested groups: `Address`, `FinancialSummary`, `InvestorContact`, `Ownership`, `OwnershipRelationship`
- Listing shapes: `InvestorListing`, `InvestorListingBase`, `ClosedInvestorListing` (sold), `OpenInvestorListing` (every status except sold)
- Closed word lists: `ListingStatus`, `PropertyType`

### Field names already in the model

**Always on `InvestorListingBase`:** `id`, `createdAt`, `updatedAt` (readonly), `title`, `description`, `propertyType`, `address`, `financials`, `contacts`, `primaryContactId`, `ownership`.

**Status-dependent:** `closedAt` is required when `status` is `"sold"`; it must not be present on any other status.

**`Address`:** `line1`, `city`, `region`, `postalCode`, `country`; optional `line2`.

**`FinancialSummary`:** numeric `askingPrice`, `currency`; optional `projectedIrrPercent`, `capRatePercent`. Asking price is a number, not `"$12,500,000"`.

**`InvestorContact`:** `id`, `name`, `role`; at least one of `email` or `phone`. `contacts` is a non-empty list. Contact `role` is ordinary text (examples in fixtures: `broker`, `owner_rep`) — not the ownership-relationship union.

**`Ownership` (one row, not a list):** `contactId`, `relationship`; optional `sharePercent`.

### Known tightenings vs the domain brief (do not “fix” silently)

Recorded in ADR-001. Product partner has not accepted the ADR yet (`Status: Proposed`).

- Types require complete `description`, `address`, `financials`, and at least one contact **even on drafts**. The brief allowed incomplete drafts.
- Types model **one** `ownership` row, not the inventory’s list of rows.
- Types add contact `id`, `primaryContactId`, and sold-only `closedAt` beyond the original inventory tables.
- `currency` is free text (example `USD`), not a closed list.

---

## 1. Client story recap

PREIshare was shipping investor listing data as loose objects and ad-hoc JSON. That let bad data reach production: missing prices, status strings spelled several ways, and nested address fields that disappeared on some screens. Sprint 2 Topic 1 modeled investor listings with **strict TypeScript types** so those mistakes fail at **compile time** (while the developer is still building) instead of in front of users.

- An **investor listing** is a property opportunity the team stores and shows.
- Actors who must share one shape: listing editor (internal ops), investor (end user), reviewer / compliance, and later website / API / database.
- Typical lifecycle: `draft` → `published` → `under_offer` → `sold`, with `archived` as the off-browse end state.
- Address, financials, contacts, and ownership stay **nested groups**, not blobs of text.

---

## 2. What we shipped this topic

| Deliverable | Path | Why it matters |
| --- | --- | --- |
| Domain brief + field inventory | `docs/domain/investor-listing-domain-brief.md`, `docs/domain/listing-field-inventory.md` | Business rules before code |
| Types package (barrel) | `src/types/index.ts` | Single import surface for `InvestorListing` and related types |
| Core + nested + relationship types | `src/types/*.ts` (`investor-listing.ts`, `address.ts`, `financial-summary.ts`, `investor-contact.ts`, `ownership.ts`, `listing-status.ts`, `property-type.ts`) | Interfaces, unions, nested objects, contacts, ownership |
| Valid fixtures | `src/fixtures/sample-investor-listings.ts` | Prove good listings type-check |
| Invalid / error cases + expected errors | `src/fixtures/invalid-listings.errors.ts`, `docs/type-safety/expected-type-errors.md` | Prove bad data is rejected |
| Typecheck script + verification checklist | `package.json` (`typecheck`), `tsconfig.typecheck.json`, `docs/type-safety/verification-checklist.md` | Repeatable safety gate |
| Decision record | `docs/decisions/ADR-001-investor-listing-types.md` | Stakeholder-facing type decisions (Proposed) |

**Valid sample exports** (all typed as `InvestorListing`; fictional only):

- `sampleDraftInfillLand` — `status: "draft"`, `propertyType: "land"`
- `samplePublishedMultifamily` — `status: "published"`, `propertyType: "multifamily"`
- `sampleUnderOfferOffice` — `status: "under_offer"`, `propertyType: "office"`
- `sampleSoldNeighborhoodRetail` — `status: "sold"`, `propertyType: "retail"`, requires `closedAt`
- `sampleArchivedIndustrial` — `status: "archived"`, `propertyType: "industrial"`

**Invalid exports that must keep failing** (do not “fix”):

`invalidStatusLive`, `invalidPropertyTypeHouse`, `invalidFlattenedAddress`, `invalidAskingPriceString`, `invalidContactNoChannel`, `invalidEmptyContacts`, `invalidOwnershipRelationship`, `invalidSoldMissingClosedAt`, `invalidDraftWithClosedAt`.

**How to verify locally:** follow `docs/type-safety/verification-checklist.md`.

- `npm run typecheck` → `tsc --noEmit -p tsconfig.typecheck.json` — must succeed (excludes the intentional-error file).
- `npx tsc --noEmit` — must still report the nine mistakes in `invalid-listings.errors.ts`.

---

## 3. What we must NOT claim is done yet

- No TanStack Start UI or listing forms are built or wired to these types.
- No Supabase / PostgreSQL tables, migrations, or pgvector work from this model.
- No HTTP API routes, request/response validation at the network boundary, or auth rules.
- No runtime schema library (for example Zod) is required by this topic unless a later topic adds one on purpose.
- No production deployment of listing create/edit flows.
- ADR-001 is still **Proposed**. Incomplete drafts vs always-complete types, one ownership row vs a list, and required `closedAt` on sold still need product-partner sign-off.

If a demo only shows green typecheck on fixtures, say: **“the data model is typed and verified; product surfaces are next.”**

---

## 4. Next sprint pickups (use the types — do not reinvent them)

### A. TanStack Start forms (UI)

- Build create/edit listing forms whose field names and option lists match `InvestorListing`, `ListingStatus`, and `PropertyType` from `src/types`.
- Prefer importing types from `src/types/index.ts` rather than copying string literals into components.
- Use `src/fixtures/sample-investor-listings.ts` as realistic form defaults / Story-style examples.
- Acceptance sketch: a form cannot submit a status outside the union without a type or validation failure during development.

### B. Supabase / PostgreSQL schema alignment (data)

- Draft table columns that mirror required listing fields, nested address/financial concepts (as columns or related tables), and constrained status/property-type values (`draft` / `published` / `under_offer` / `sold` / `archived`; `multifamily` / `office` / `retail` / `industrial` / `mixed_use` / `land`).
- Document any intentional difference between TypeScript optional fields and database NULL rules in a follow-up ADR—do not silently diverge. Call out drafts (brief allowed incomplete; types currently do not) and ownership (types: one row; inventory: list).
- Plan indexes and relationships (contacts, ownership via `contactId` / `primaryContactId`) from the same domain brief that drove the types.
- Acceptance sketch: a row that would fail `InvestorListing` assignment is also rejected by DB constraints or insert validation.

### C. API boundaries (server)

- Define request/response shapes for list/get/create/update that re-export or compose `src/types` instead of anonymous JSON.
- Keep write endpoints from accepting free-form status strings; align with `ListingStatus`.
- Add tests that send fixture-shaped payloads (valid) and known-bad payloads (the nine invalid cases) at the boundary.
- Acceptance sketch: API handlers never widen listing status back to plain `string` without an explicit, documented escape hatch.

```text
Client pain (loose JSON)
        |
        v
 Domain brief + field inventory
        |
        v
 Strict TS types + fixtures + typecheck + ADR-001   <-- you are here
        |
        +--> TanStack Start forms (UI)
        +--> Supabase/PostgreSQL schema (data)
        +--> API routes & validation (boundary)
```

---

## 5. Prompting and review self-assessment

- **Prompting habit that helped:** I asked the agent to open the domain brief, field inventory, type barrel, and ADR **before** writing, and to paste closed lists (`ListingStatus`, `PropertyType`, `OwnershipRelationship`) into the draft to make sure that all information is relevant and accurate.
- **Second prompting habit that helped:** I treated this as a bridge document, not a second ADR: “few bullets, attach paths, do not claim UI/DB/API are done.” That kept the handoff from rewriting Topic 1.
- **Review habit that caught an agent mistake:** I compared generated field names against `src/types/index.ts` and the sample fixtures. Anything not in the barrel (`InvestorListing`, nested groups, `closedAt` only on `sold`) got cut. I also checked that the nine invalid exports were listed as **must stay broken**, not as bugs to fix.
- **What I would do differently next topic:** Keep a closer eye on the requirements to verify that all requirements are being met.
- **Confidence (1–5) explaining InvestorListing to a teammate:** 4 — I can walk the five statuses, six property types, nested address/financials/contacts, one ownership row, and sold-only `closedAt`; I would still point at ADR-001 follow-ups for drafts vs complete types.

---

## 6. Handoff checklist for the next owner

- [ ] Read ADR-001 and this handoff before opening a UI or SQL PR
- [ ] Import listing types from `src/types/index.ts` only
- [ ] Keep `npm run typecheck` green on valid fixtures
- [ ] Do not delete intentional invalid fixture files; they document safety
- [ ] File a new ADR if product changes allowed statuses or required fields
- [ ] Do not treat ADR-001 as Accepted until a product partner signs off on drafts, ownership cardinality, and `closedAt`
