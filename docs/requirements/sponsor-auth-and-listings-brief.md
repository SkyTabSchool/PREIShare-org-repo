# Sponsor Auth & Property Listings — Requirements Brief (Sprint 4)

## Client story (restated)

PREIshare sponsors need a secure way to sign in to the dashboard and manage
real property listings stored in PostgreSQL. Secret keys and privileged
database access must stay on the server and never ship in the browser bundle.

## Actors

| Actor | Goal |
| --- | --- |
| Sponsor | Sign up / log in, create and view their property listings |
| Unauthenticated visitor | Reach login/signup only; cannot see listing data |
| System (server) | Enforce session checks, talk to Supabase with correct keys |

## Goals for this sprint

1. Sponsors can register and log in (email/password or equivalent Supabase Auth).
2. Dashboard routes that show listings require a valid session.
3. Property listings are stored in Postgres (not mock arrays in the client).
4. Sponsors can create and read listings that belong to them.
5. Environment secrets are separated: publishable/anon values may be client-safe;
   service-role and other secrets stay server-only.

## Out of scope (defer)

- Payment processing, document uploads, full admin roles
- Social OAuth providers beyond what Supabase email auth covers
- Production custom domain / multi-tenant orgs

## Current dashboard observations

Observed in the repo on 2026-10-22. This is the starting point this sprint
must move past.

- Framework: TanStack Start + React + TypeScript (existing scaffold). Vite,
  Tailwind CSS v4, file-based TanStack Router. App code lives under `src/`.
- Routes found:
  - `/` — starter home (`src/routes/index.tsx`). Links straight to
    `/dashboard` with no session check.
  - `/about` — scaffold about page (`src/routes/about.tsx`).
  - `/dashboard` — layout shell (`src/routes/dashboard/route.tsx`) wrapping
    child routes in `AppShell`. No `beforeLoad` or other session guard.
  - `/dashboard/` — overview (`src/routes/dashboard/index.tsx`).
  - `/dashboard/portfolio` — portfolio table.
  - `/dashboard/deals` — deals list.
  - `/dashboard/profile` — profile card.
  - Nav (`src/components/layout/navConfig.ts`) only lists Home, Portfolio,
    Deals, and Profile. There is no login, signup, or listings route.
- Listings today: not rendered on any dashboard page, and not stored in
  Postgres. Domain types exist in `src/types/investor-listing.ts` (and related
  types). Fictional samples live in `src/fixtures/sample-investor-listings.ts`
  for types and tests; they are not loaded by a route. What the dashboard
  actually shows is client-side mock or empty placeholder data:
  - `/dashboard/` passes empty holdings and activity arrays and hardcodes
    metric cards (`demoMetrics`) whose values are em dashes.
  - `/dashboard/portfolio` renders `PortfolioTable`, which defaults to a
    hardcoded `mockHoldings` array.
  - `/dashboard/deals` renders `DealsList`, which defaults to a hardcoded
    `mockDeals` array (investment-opportunity shape, not `InvestorListing`).
  - `/dashboard/profile` renders `ProfileCard`, which defaults to a hardcoded
    `mockProfile`.
  - `PortfolioSummary` and `RecentActivity` also export mock constants, but
    the home route does not use them.
- Auth today: none. `src/lib/user.ts` exports `getUser()`, which always
  returns `null`. The dashboard header (`src/components/dashboard/Header.tsx`)
  shows a static “Investor” chip and is commented as a placeholder, not
  session state. Anyone who can open `/dashboard` sees the shell. There is
  no Supabase client (`src/lib/supabase.ts` is named in project rules and is
  not on disk), no `supabase/` project folder, and no `.env` or `.env.example`.
- Product mismatch to note: the current shell is an **investor** dashboard
  (nav labels, “Investor” header, portfolio/deals/profile). This sprint’s
  actor is a **sponsor** who signs in and manages their own property listings.
  Closing the gaps below means adding sponsor auth and listing flows; it does
  not, by itself, replace the investor mock pages.
- Gaps this sprint must close: login/signup, session-aware dashboard shell,
  Postgres-backed list + create flows, env separation.

## Success criteria (how we know it worked)

- [ ] A sponsor can sign up and log in and is redirected to a protected dashboard.
- [ ] Logged-out users cannot open protected dashboard listing pages.
- [ ] Creating a listing persists it in Postgres and it appears after refresh.
- [ ] A sponsor only sees their own listings (row-level security intentional).
- [ ] No service-role or other secret key appears in client bundle or committed `.env`.
- [ ] `.env.example` documents required variables without real secret values.

## Server-only boundary (must not ship to the browser)

These must never appear in client-side code, `VITE_*` variables, the browser
bundle, or a committed `.env`:

- Supabase **service role** key (and any other privileged secrets)
- Direct privileged DB URLs if used outside Supabase client helpers
- Any server-only env vars used for admin or bypass operations

Client-safe (when intentionally exposed by Supabase design):

- Project URL
- Anon / publishable key (still respect RLS; never treat as a secret bypass)

Reads and writes that depend on the signed-in sponsor, or that would need a
privileged key, go through TanStack Start server functions
(`createServerFn` / server-only helpers). The anon key is not a substitute
for a session check or for row-level security.

## Implementation notes for later prompts

- Prefer server loaders/actions in TanStack Start for reads/writes that need
  the user session or privileged checks.
- Data model and RLS policies will be designed in later steps; this brief only
  locks the product contract.
- Handoff later should map deliverables back to the goals and success criteria above.
