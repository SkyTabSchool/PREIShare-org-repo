# Investor listing types — verification checklist

Use this list before review. Check each box only when you have evidence.

Do **not** “fix” `src/fixtures/invalid-listings.errors.ts`. Those objects are
supposed to fail. Examples in fixtures must stay fictional.

## A. Domain coverage

- [ ] Every required field from docs/domain/listing-field-inventory.md appears on InvestorListing (or a nested type it uses).
      Evidence: compare the inventory tables to `src/types/investor-listing.ts` plus `address.ts`, `financial-summary.ts`, `investor-contact.ts`, and `ownership.ts`.
- [ ] Listing status values match the allowed business statuses (no free-form strings).
      Evidence: `src/types/listing-status.ts` is exactly `draft`, `published`, `under_offer`, `sold`, `archived` (domain brief + inventory).
- [ ] Property type values match the allowed property kinds.
      Evidence: `src/types/property-type.ts` is exactly `multifamily`, `office`, `retail`, `industrial`, `mixed_use`, `land`.
- [ ] Address and FinancialSummary nested shapes match the inventory.
      Evidence: `Address` has `line1` / `city` / `region` / `postalCode` / `country` and optional `line2`. `FinancialSummary` has numeric `askingPrice`, `currency`, and optional return metrics.
- [ ] Investor contact and ownership relationship fields match the domain brief.
      Evidence: each `InvestorContact` has a name and email and/or phone; `OwnershipRelationship` is only `primary_owner`, `co_owner`, or `broker`.

## B. Type safety shape

- [ ] Public types are exported from src/types/index.ts.
      Evidence: `index.ts` re-exports `InvestorListing`, nested types, and the closed unions.
- [ ] Discriminated / narrowed status modeling (if used) still matches docs/type-safety/expected-type-errors.md.
      Evidence: `InvestorListing` requires `closedAt` only when `status` is `sold`; `invalidSoldMissingClosedAt` and `invalidDraftWithClosedAt` still fail for those reasons.
- [ ] Readonly intent is documented where the team agreed on it.
      Evidence: `id`, `createdAt`, and `updatedAt` are `readonly` on `InvestorListingBase`, with comments that id is stable and timestamps are not a business key.

## C. Fixtures

- [ ] src/fixtures/sample-investor-listings.ts typechecks cleanly and includes more than one realistic listing.
      Evidence: five fictional samples (draft, published, under_offer, sold, archived) typed as `InvestorListing`; they are included by `npm run typecheck`.
- [ ] src/fixtures/invalid-listings.errors.ts still demonstrates the intentional failures listed in docs/type-safety/expected-type-errors.md.
      Evidence: the nine exports in that file match the expected-errors quick map. Do not silence them with `any`, `@ts-ignore`, or `@ts-expect-error`.
- [ ] Expected-error notes still match the real compiler messages (no stale examples).
      Evidence: from the project root, `npx tsc --noEmit` still reports those nine mistakes. Compare the messages to `docs/type-safety/expected-type-errors.md`.

## D. Typecheck gate

- [ ] package.json defines a `typecheck` script that runs `tsc --noEmit`.
      Evidence: `"typecheck": "tsc --noEmit -p tsconfig.typecheck.json"`.
- [ ] Running the typecheck script from the project root succeeds for valid sources.
      Evidence: `npm run typecheck` prints no TypeScript errors and exits `0`.
- [ ] The intentional invalid fixtures file is not required to pass the normal typecheck gate.
      Evidence: `tsconfig.typecheck.json` excludes `src/fixtures/invalid-listings.errors.ts`. That file is only in the root `tsconfig.json` compile (`npx tsc --noEmit`).
- [ ] src/types/README.md explains how a beginner runs typecheck and what success looks like.
      Evidence: README names `npm run typecheck`, describes a clean exit with no error messages, and explains that the intentional error file is handled separately.

## E. Sign-off

- [ ] I re-ran typecheck after any last fixes.
- [ ] I would hand this package to a teammate without a verbal walkthrough of secret steps.
