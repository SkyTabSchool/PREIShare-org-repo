# Sprint 4 Handoff — Sponsor Auth & Postgres Property Listings

**Project:** PREIshare dashboard
**Sprint:** 4 (Topic 1) — Supabase auth & database
**Audience:** Sponsors and the next-sprint implementer
**Status date:** 2026-10-22
**Verification:** Overall **PASS** on 2026-10-22 (local Vite at `http://localhost:3000`). See [docs/verification/sprint4-auth-listings-checklist.md](../verification/sprint4-auth-listings-checklist.md).

This handoff maps what shipped back to the client story in [docs/requirements/sponsor-auth-and-listings-brief.md](../requirements/sponsor-auth-and-listings-brief.md). It does not replace that brief, the schema, or the env checklist.

## 1. Client story recap

PREIshare sponsors need a secure way to sign in and manage real property listings stored in PostgreSQL — moving past mock data in the browser — while secret keys stay out of the client bundle.

The brief’s actors and sprint goals are the contract this handoff is scored against:

| Actor | Goal in the brief |
| --- | --- |
| Sponsor | Sign up / log in, create and view their property listings |
| Unauthenticated visitor | Reach login/signup only; cannot see listing data |
| System (server) | Enforce session checks and talk to Supabase with the correct keys |

Sprint goals: (1) email/password registration and login, (2) listing dashboard routes require a session, (3) listings live in Postgres, (4) a sponsor can create and read the rows they own, (5) publishable values may be client-safe and the service-role key stays server-only.

Deferred by the brief, and still deferred: payment processing, document uploads, full admin roles, social OAuth beyond Supabase email auth, and a production custom domain or multi-tenant orgs. This sprint also leaves the existing investor mock pages (portfolio, deals, profile) in place.

## 2. Delivered vs original request

| Client need (from the brief) | Delivered? | Where / evidence |
| --- | --- | --- |
| Secure sponsor login. Goal 1 and success criteria “sign up and log in and land on a protected dashboard.” Unauthenticated visitors stay on login/signup (goal 2). | Yes | `/auth/signup` and `/auth/login` (`src/routes/auth/login.tsx`). Checklist 2.1–2.4 PASS: manual signup completed; login set httpOnly `preishare_access_token` and `preishare_refresh_token` via `establishSession` in `src/server/auth.ts` and redirected to `/dashboard`; signed-out `GET /dashboard`, `/dashboard/listings`, and `/dashboard/listings/new` returned `307` to `/auth/login`; Sign out (`signOutSession` in `src/routes/dashboard/route.tsx`) cleared the cookie jar and listing titles no longer rendered. |
| Postgres-backed listings (create and read). Goals 3–4 and “creating a listing persists it in Postgres and it appears after refresh.” | Yes | Table `public.property_listings`. UI create on `/dashboard/listings/new` and list on `src/routes/dashboard/listings/index.tsx` go through `createListing` and `listMyListings` in `src/server/listings.ts` (checklist 3.1–3.4 PASS). The index loads `listMyListings` and does not import `src/fixtures/sample-investor-listings.ts`. A full page load did not call `/rest/v1/property_listings` from the browser; the rendered titles matched Postgres rows. |
| Row-level security so a sponsor only sees allowed rows. Success criterion “a sponsor only sees their own listings (row-level security intentional).” | Partial | Migration `supabase/migrations/20250321000000_property_listings.sql` enables RLS and defines `listings_select_own`, `listings_insert_own`, `listings_update_own`, and `listings_delete_own` (checklist 1.1–1.4 and 4.1–4.4 PASS against [docs/data-model/property-listings-schema.md](../data-model/property-listings-schema.md)). User B’s UI and JWT `select` omitted User A’s rows; a cross-owner insert failed with Postgres `42501`. The app’s list/create/update path still uses the service-role client, so those calls bypass RLS and filter `owner_id` in application code (checklist section 6, left unchanged). |
| Secrets kept out of the client bundle. Goal 5 and success criteria on service-role absence plus a placeholder `.env.example`. | Yes | Checklist 5.1–5.5 PASS. `.env` is gitignored; `.env.example` has placeholders only. `src/lib/supabase/client.ts` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. `src/lib/supabase/server.ts` reads `process.env.SUPABASE_URL` and `process.env.SUPABASE_SERVICE_ROLE_KEY`. Browser `apikey` headers during signup, login, create, and sign-out carried the anon key. Names and exposure rules: [docs/setup/supabase-env-checklist.md](../setup/supabase-env-checklist.md). |

Verification signed the client story as covered: sponsors can log in, listing pages load Postgres rows split by owner, and the service-role key stayed out of the dev client and the browser request log. Two follow-ups sit beside that sign-off and are written up in checklist section 6 and the handoff notes there. First, `listMyListings` and `createListing` call `createServerSupabaseClient()`, which reads `SUPABASE_SERVICE_ROLE_KEY`, so RLS does not run on that path; the owner filter is `getUser()` in application code. Direct reads with a sponsor JWT still enforce the own-row policies, and each signed-in index showed only that sponsor’s titles. Second, a signup click before hydration submitted the form as GET and put `email` and `password` on the query string; a later hydrated submit left the password out of the URL, and manual signup did not report it. That early-click case is still open. Repeated scripted Auth calls returned `email rate limit exceeded`; the manual signup used for row 2.1 did not. `mailer_autoconfirm` was false when settings were read, so a new signup can wait on email confirmation before login (the scripted User A and User B accounts were confirmed through the Auth admin API). A production `npm run build` bundle was not opened. Live `pg_policy` was not queried (the project’s SQL endpoints returned 404); policy behavior was checked with each user’s JWT instead.

## 3. Architecture decisions

- **Auth.** Supabase email/password Auth. Protected dashboard routes require a session. Signed-out requests to the dashboard and listing routes redirect to `/auth/login`. Session cookies are httpOnly (`preishare_access_token`, `preishare_refresh_token`); `document.cookie` did not contain the access token after login. Sign-out is a server function on the dashboard route.
- **Data.** PostgreSQL `public.property_listings`, specified in [docs/data-model/property-listings-schema.md](../data-model/property-listings-schema.md) and created by `supabase/migrations/20250321000000_property_listings.sql`. Columns verified in the project: `id`, `owner_id`, `title`, `description`, `address_line1`, `city`, `region`, `postal_code`, `country` (default `'US'`), `price` (`numeric(12,2)`, `price >= 0`), `status` (`draft`, `published`, `archived`), `created_at`, `updated_at`. `owner_id` references `auth.users(id)` with `ON DELETE CASCADE`. The server sets `owner_id` from the session; clients do not supply a different owner.
- **Authorization.** RLS is enabled. Authenticated policies are own-row only: `listings_select_own`, `listings_insert_own` (`WITH CHECK (owner_id = auth.uid())`), `listings_update_own`, `listings_delete_own`. Anonymous users have no listing policy. There is no world-readable “published listings” policy. The schema’s operation map says sponsor list/create should use a server Supabase client that carries the user session so those policies apply. The code that shipped uses the service-role client for list, create, and update, which bypasses RLS. The service-role key remains appropriate for server admin and maintenance, and it stays off the browser. Update and delete policies are in place for a later UI; they are not a Sprint 4 success criterion.
- **Clients.** `src/lib/supabase/server.ts` reads server env only, including the service-role key. `src/lib/supabase/client.ts` reads the public URL and anon key. Browser auth calls Supabase with the anon key and the user session. Listing create/read in this sprint go through TanStack Start server functions in `src/server/listings.ts`, not through a browser query to `/rest/v1/property_listings`.
- **Env hygiene.** Vite’s public prefix in this repo is `VITE_` (`app.config.ts` does not set a custom `envPrefix`). Real values stay in a local untracked `.env`. The database password stays in a password manager.

| Name | Exposure | Where it may be read |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Public / browser-safe | Client bundle (`import.meta.env`) and server |
| `VITE_SUPABASE_ANON_KEY` | Public / browser-safe | Client bundle and server. Safe only because RLS and a session check still apply |
| `SUPABASE_URL` | Server-only (optional duplicate of the project URL) | `process.env` in server code |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only secret. Bypasses RLS | `process.env` in server routes and loaders |

## 4. How to run locally

1. Copy `.env.example` to `.env` and fill values from the Supabase project (Project Settings → API). Use the names in [docs/setup/supabase-env-checklist.md](../setup/supabase-env-checklist.md): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optional `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`. Placeholders in `.env.example` are `https://your-project-ref.supabase.co`, `your-anon-or-publishable-key`, and `your-service-role-key`. Restart the dev server after editing `.env`.
2. Apply `supabase/migrations/20250321000000_property_listings.sql` if the table is not already present, and confirm RLS is enabled on `property_listings` with the four own-row policies. The verification project already has this table.
3. From the repo root, install dependencies and start the app with the project script: `npm install`, then `npm run dev` (Vite on port 3000).
4. Sign up at `/auth/signup` or log in at `/auth/login` as a test sponsor. If email confirmation is required, confirm the address before login. Open `/dashboard/listings`, create one listing at `/dashboard/listings/new`, refresh, and confirm the same title is still served from Postgres. A second sponsor account should see only their own titles.

Recheck accounts and listing ids left in the verification project are listed at the bottom of the checklist. Passwords are not recorded there.

## 5. Known limitations

These are the limits that are true after the 2026-10-22 verification pass and the written scope of the brief and schema.

- Listing list/create/update in `src/server/listings.ts` bypass RLS with the service-role key. Own-row filtering on that path is application code. JWT reads against PostgREST do enforce the policies. Checklist section 6 records this with no code change.
- An early signup submit, before the route finishes hydrating, can GET the form and place the password in the query string. Hydrated submit and the manual signup used for sign-off did not show that. The early-click case is still open.
- With `mailer_autoconfirm` false, a new email/password signup can sit unconfirmed until the user confirms. Scripted back-to-back Auth calls can also hit `email rate limit exceeded`.
- Sprint 4 UI covers create and read. Update and delete are closed to the owning sponsor by RLS and are not a success criterion for this sprint.
- Listing columns are the Sprint 4 set in the schema (title, description, flat address columns, price, and `status` of `draft` / `published` / `archived`). Images, media, nested address groups, and an approval workflow are not in this sprint.
- Full-text search and pgvector embeddings are deferred to a later sprint. There is no public catalog of published listings.
- Investor portfolio, deals, and profile pages still render their existing mock data. Sponsor auth and listings sit beside that shell.
- Payments, document uploads, full admin roles, social OAuth, production custom domain, and multi-tenant orgs stay out of scope, as the brief deferred them. Multi-sponsor shared ownership is out of scope in the schema; isolation is one `owner_id` per row.
- The production client bundle from `npm run build` was not inspected. The dev-server modules and the browser request log did not send the service-role key.
- Test users and listings from the verification pass were left in the Supabase project so the checklist can be rechecked.

## 6. Recommended next-sprint work

Pick one theme with stakeholders. Each option keeps Sprint 4 auth, the `property_listings` table, own-row RLS, and the public-vs-server env split. None of them replaces sponsor login or moves `SUPABASE_SERVICE_ROLE_KEY` into the browser.

Before adding write paths, point list/create/update at a server Supabase client that carries the sponsor’s session, so the policies in the migration apply. That closes the checklist section 6 gap and matches section 5 of the schema. The service-role key stays on the server for admin or maintenance only.

1. **Richer listing fields.** Add columns, server-side validation, and edit/delete screens on the current `property_listings` row. `listings_update_own` and `listings_delete_own` already scope those commands to `owner_id = auth.uid()`. Address nesting (to match the investor-listing types) and any new required fields should be a migration on this table, still created and read through the session-scoped server functions. Secret separation stays as documented in the env checklist.
2. **Approvals workflow.** Extend the existing `status` check (`draft`, `published`, `archived`) with submit and approve/reject states, and decide which authenticated role may transition them. New transitions belong in RLS policies plus the dashboard UI, on top of the current session guard. A reviewer who is not the owner is a new policy decision; it does not remove `listings_select_own` for sponsors. The service-role key stays out of that UI path.
3. **pgvector search.** Add embeddings and similarity search only after create/read (and the user-session write path above) are stable. The schema already defers full-text and pgvector. Search results still have to honor own-row select policies. Do not add a world-readable catalog. Embedding jobs that need a privileged key run in server code with `SUPABASE_SERVICE_ROLE_KEY`, same exposure rules as today.

## 7. Open questions for stakeholders

- Who may create listings, and is a view-only sponsor required? This sprint lets every signed-in sponsor create and read their own rows. Logged-out visitors see login and signup only.
- Is shared ownership or org tenancy required next? Isolation today is one `owner_id` per row. The brief deferred multi-tenant orgs, and the schema deferred multi-sponsor shared ownership.
- Preferred next theme: richer fields, approvals, or search? Section 6 is written so any of the three builds on the current auth and RLS.
- Keep the default `country` of `'US'`? The brief does not name a country.
- Keep `status` as `text` plus a check constraint, or move to a Postgres enum when new approval values are added? The schema proposes `text` plus a check so later values land in a normal migration.
- When a sponsor removes a listing, is that a hard `DELETE` or a `deleted_at` soft-delete? Removing the auth user already cascades listing rows. That does not decide the in-app delete behavior.
- Should address columns later split into the nested address group used by the investor-listing types? This sprint stores them as columns on `property_listings`.
- Confirm priority of the service-role gap: switch listing server functions to the sponsor session before the next write features. The schema and the RLS review ask for that; verification left the code as-is.

## 8. Source artifacts

- [docs/requirements/sponsor-auth-and-listings-brief.md](../requirements/sponsor-auth-and-listings-brief.md) — client story, goals, success criteria, server-only boundary
- [docs/verification/sprint4-auth-listings-checklist.md](../verification/sprint4-auth-listings-checklist.md) — PASS/FAIL evidence and the unfixed gaps in section 6
- [docs/data-model/property-listings-schema.md](../data-model/property-listings-schema.md) — columns, ownership, RLS, server vs browser map
- [docs/setup/supabase-env-checklist.md](../setup/supabase-env-checklist.md) — public `VITE_*` names vs server-only secrets

Evidence those docs already cite: `supabase/migrations/20250321000000_property_listings.sql`, `docs/data-model/rls-policy-review.md`, `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/server/auth.ts`, `src/server/listings.ts`.
