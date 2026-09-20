# PREIshare investor listing types

This folder holds **shared TypeScript types** for PREIshare investor listings.

## Why this exists
Loose objects and ad-hoc JSON let bad data reach production (missing price,
status spelled three ways, nested address fields that vanish on one screen).
These types catch those mistakes at **compile time**—before users see them.

## What belongs here
- Domain type modules only (listing, address, status, contacts, etc.)
- No UI components, no API route handlers, no database clients

## How to check types

From the project root after `npm install`, run:

```bash
npm run typecheck
```

That is the everyday command. It asks TypeScript to read the valid project
sources (these types, the sample listings, routes, and UI) and report mistakes
**without writing any JavaScript files**.

**What success looks like:** the command prints the `typecheck` script line,
then finishes with **no error messages** and a **zero exit code**. Your
terminal returns to a prompt. If something in the real app sources is wrong,
you will see file paths and `TSxxxx` codes instead—those are real problems to
fix.

**The intentional error file is separate.**
`src/fixtures/invalid-listings.errors.ts` is a teaching fixture: objects that
*look* like listings but break the rules on purpose. Do not “fix” that file.
`npm run typecheck` skips it (via `tsconfig.typecheck.json`) so a clean check
can pass.

To see those expected errors, compile with the root config:

```bash
npx tsc --noEmit
```

A human checklist for each expected error is in
`docs/type-safety/expected-type-errors.md`. Application routes and UI must not
import the invalid fixture file.

## Strict mode (plain language)
`strict: true` in `tsconfig.json` turns on the checker’s safest rules. Combined
with flags like `noUncheckedIndexedAccess`, it refuses incomplete or loosely
typed data so the team can trust shared listing models.

## Source of truth
Business vocabulary and field rules come from:
`docs/domain/investor-listing-domain-brief.md`
(and the field inventory from Step 1).
