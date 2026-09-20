# Expected type errors (invalid listing fixtures)

This page is a human checklist for `src/fixtures/invalid-listings.errors.ts`.

Those objects look like investor listings, but each one breaks a business rule from
[investor-listing-domain-brief.md](../domain/investor-listing-domain-brief.md).
The TypeScript types in `src/types/` are supposed to **refuse** every export in
that file before the app runs.

Do **not** “fix” the invalid fixtures. The errors are the proof that the types
are doing their job.

## How to read this page

You do not need to be a TypeScript expert.

- **What is wrong** is the business problem (what would hurt investors or
  reviewers if this data shipped).
- **What should catch it** is the field or type rule that exists to stop that
  problem.
- **Kind of TypeScript error** is the *shape* of the complaint, in everyday
  words. You might see a code such as `TS2322` in the terminal; treat that as
  “this value does not match the label we promised,” then match it to the kind
  below.

A **string literal** here means an *exact allowed word* (for example `draft`),
not any free-text sentence. A **missing property** means a required field is
absent. **Number vs string** means we asked for a numeric amount, not a
formatted money label like `"$12,500,000"`. An **empty array** means a list
that must contain at least one item was written as `[]`.

To see the live errors from the project root after `npm install`:

```bash
npm run typecheck
```

Application routes and UI must not import the invalid fixture file. Import it
only when you want the checker to report these mistakes.

## Quick map

| Id | Export name | Business problem (one line) | Error kind |
| --- | --- | --- | --- |
| `status-live` | `invalidStatusLive` | Status uses an alias (`LIVE`) instead of the allowed lifecycle words | Wrong string literal |
| `property-type-house` | `invalidPropertyTypeHouse` | Asset class uses a spelling that is not in the allowed set (`house`) | Wrong string literal |
| `flattened-address` | `invalidFlattenedAddress` | Address is one blob of text instead of street / city / region / postal / country | String vs nested object |
| `asking-price-string` | `invalidAskingPriceString` | Asking price is a money string instead of a number | Number vs string |
| `contact-no-channel` | `invalidContactNoChannel` | Contact has a name and role but no email or phone | Missing property (email or phone) |
| `contacts-empty` | `invalidEmptyContacts` | A published listing has nobody to reach (`contacts` is an empty list) | Empty array (needs at least one contact) |
| `ownership-relationship` | `invalidOwnershipRelationship` | Ownership is free text (`majority investor`) instead of the closed list | Wrong string literal |
| `sold-missing-closed-at` | `invalidSoldMissingClosedAt` | A sold listing has no close date | Missing property (`closedAt`) |
| `draft-with-closed-at` | `invalidDraftWithClosedAt` | A draft listing carries a close date it should not have | Forbidden extra field (`closedAt` only on sold) |

## Fixture by fixture

### `status-live` — `invalidStatusLive`

**What is wrong:** The listing claims it is `LIVE`. Reviewers and later screens
cannot trust that. PREIshare only uses five lifecycle words: `draft`,
`published`, `under_offer`, `sold`, and `archived`. Aliases, shouty
capitalization, and marketing labels (`LIVE`, `Active`, `pending`) are not
statuses.

**What should catch it:** `InvestorListing.status`, which must be a
`ListingStatus` value from `src/types/listing-status.ts`.

**Kind of TypeScript error:** Wrong string literal. `"LIVE"` is not one of the
allowed status words, so it is not assignable to `status`.

### `property-type-house` — `invalidPropertyTypeHouse`

**What is wrong:** The asset class is recorded as `house`. That spelling is not
in the product set. If teammates type `house`, `multi_family`, or `commercial`,
search, filters, and reports will not group listings the same way.

**What should catch it:** `InvestorListing.propertyType`, which must be a
`PropertyType` value from `src/types/property-type.ts` (`multifamily`, `office`,
`retail`, `industrial`, `mixed_use`, `land`).

**Kind of TypeScript error:** Wrong string literal. `"house"` is not assignable
to `PropertyType`.

### `flattened-address` — `invalidFlattenedAddress`

**What is wrong:** Street, city, region, postal code, and country are mashed
into one string. A later screen that needs “city only” or “postal code only”
has nothing structured to read. That is how a city (or ZIP) disappears for
investors.

**What should catch it:** `InvestorListing.address` must be a nested `Address`
object (`line1`, `city`, `region`, `postalCode`, `country`; optional `line2`),
not a single text field. See `src/types/address.ts`.

**Kind of TypeScript error:** String vs nested object. A `string` is not
assignable to `Address`.

### `asking-price-string` — `invalidAskingPriceString`

**What is wrong:** The asking price is `"$12,500,000"` instead of the number
`12500000`. Formatted money strings are for display. If the stored value is
text, sorting, comparing, and math on price will be wrong or impossible.

**What should catch it:** `FinancialSummary.askingPrice` in
`src/types/financial-summary.ts`, which must be a `number`. Currency stays in
the separate `currency` field (for example `USD`).

**Kind of TypeScript error:** Number vs string. A `string` is not assignable to
`askingPrice: number`.

### `contact-no-channel` — `invalidContactNoChannel`

**What is wrong:** The contact has a name and a role, but no way to reach them.
A listing investors can see needs at least one person with an email, a phone,
or both. Reviewer / compliance cannot trust “Jordan Lee, broker” with no
channel.

**What should catch it:** `InvestorContact` in `src/types/investor-contact.ts`.
Each contact must include `email`, `phone`, or both. Name and role alone are
not a complete contact.

**Kind of TypeScript error:** Missing property. The object is not a valid
`InvestorContact` because it has neither `email` nor `phone` (the checker
typically reports that `phone` or `email` is required).

### `contacts-empty` — `invalidEmptyContacts`

**What is wrong:** The listing is `published` (visible to investors) but
`contacts` is an empty list. Reviewer / compliance cannot trust a card with no
person to call. A listing investors can see needs at least one contact with a
reachable channel.

**What should catch it:** `InvestorListing.contacts` in
`src/types/investor-listing.ts`. The field is a non-empty list: at least one
`InvestorContact`, not `InvestorContact[]` which would still allow `[]`.

**Kind of TypeScript error:** Empty array. `[]` is not assignable because the
target requires at least one contact (the checker typically reports that the
source has 0 elements but the target requires 1).

### `ownership-relationship` — `invalidOwnershipRelationship`

**What is wrong:** Ownership is written as `"majority investor"`. That is a
sentence, not a shared label. The next teammate might type “majority owner”
or “lead investor,” and the product can no longer filter or display
relationships consistently.

**What should catch it:** `Ownership.relationship`, which must be an
`OwnershipRelationship` value from `src/types/ownership.ts`: `primary_owner`,
`co_owner`, or `broker`.

**Kind of TypeScript error:** Wrong string literal. `"majority investor"` is
not assignable to `OwnershipRelationship`.

### `sold-missing-closed-at` — `invalidSoldMissingClosedAt`

**What is wrong:** The listing is marked `sold` (a closed deal kept for
history) but has no close date. History, reporting, and “when did this leave
the market?” all need that date.

**What should catch it:** The `InvestorListing` rule in
`src/types/investor-listing.ts`: when `status` is `sold`, `closedAt` is
required (an ISO date string).

**Kind of TypeScript error:** Missing property. A sold listing without
`closedAt` is not assignable to `InvestorListing`.

### `draft-with-closed-at` — `invalidDraftWithClosedAt`

**What is wrong:** The listing is still a `draft` (internal only; not visible
to investors) but it already has a `closedAt` date. A close date on a draft
is leftover or contradictory data. Only a sold listing should carry that
field.

**What should catch it:** The same `InvestorListing` status split: for every
status except `sold`, `closedAt` is not used (`closedAt` must be absent /
undefined). See `src/types/investor-listing.ts`.

**Kind of TypeScript error:** Forbidden extra field on this status (in
TypeScript terms: `closedAt` as a `string` is not assignable to `undefined`
on a non-sold listing).

## What this page does not cover

- Valid sample listings live in `src/fixtures/sample-investor-listings.ts`.
  Those should type-check cleanly.
- Runtime validation (forms, APIs, the database) is a later concern. These
  errors are **compile-time** only: they stop bad shapes from being treated as
  `InvestorListing` in code.
- Do not paste private investor data into fixtures or into this file. The
  examples here are fictional.
