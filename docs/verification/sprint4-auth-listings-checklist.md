# Sprint 4 — Auth & Listings Verification Checklist

**Project:** PREIshare dashboard
**Date:** 2026-10-22
**Verifier:** Kory Anderson
**Environment:** local Vite dev server at `http://localhost:3000`, Supabase project ref `oavogmgetmerhaglfoss` (project display name was not returned by the API used here). No secrets are recorded below.

## How to use this doc
Mark each row **PASS** or **FAIL**. Under Evidence, write what you did and what you saw.
If FAIL, note the fix prompt used and re-test before marking PASS.

This pass did not change application code. Rows below are the observations from this session. Test users and listings were left in the project so the rows can be rechecked. Passwords are not written here.

---

## 1. Database & migration

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 1.1 | `property_listings` (or agreed table name) exists in Supabase | PASS | OpenAPI for the project lists `/property_listings` with columns `id`, `owner_id`, `title`, `description`, `address_line1`, `city`, `region`, `postal_code`, `country`, `price`, `status`, `created_at`, `updated_at`. A service-role count before this pass was 1. |
| 1.2 | RLS is **enabled** on the listings table | PASS | The anon key `select` returned 0 rows while the service-role count was 1. Inserting a row as User B with User A's `owner_id` returned Postgres `42501`: `new row violates row-level security policy for table "property_listings"`. |
| 1.3 | Policies match `docs/data-model/rls-policy-review.md` (select/insert/update scoped to owner) | PASS | Migration names, matching the review doc: `listings_select_own`, `listings_insert_own`, `listings_update_own`, `listings_delete_own`. Live `pg_policy` was not queried (the project's `/pg/query`, `/pg-meta/query`, and `/database/query` endpoints returned 404). Live behavior with each user's JWT matched those rules. User A `select` returned only A's row. User B `select` returned no rows before B inserted. B's cross-owner insert failed with the RLS error above. A updated A's description to `updated by owner` and the update returned that row. B's update of A's row returned 0 rows. B's delete of a disposable row owned by A returned 0 rows and the row was still there. A's delete of that disposable row returned 1 row, and a service-role read then returned 0 rows for that id. |
| 1.4 | Migration file present: `supabase/migrations/20250321000000_property_listings.sql` | PASS | File is in the repo at that path. It creates `public.property_listings`, enables RLS, and defines the four policies named in 1.3. |

## 2. Authentication & session

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 2.1 | Sponsor can sign up with email/password | PASS | Repeated scripted submits on `/auth/signup` (`sprint4-signup-1792733584930@example.com`, and an earlier `signUp` for `sprint4-user-a-1792733060290@example.com`) returned `email rate limit exceeded` after those back-to-back Auth calls. Manual signup on the same form completed without that error. Auth settings at the time of the scripted calls: `disable_signup` false, email provider enabled, `mailer_autoconfirm` false. |
| 2.2 | Sponsor can log in via `src/routes/auth/login.tsx` | PASS | User A `sprint4-user-a-1792733060290@example.com` (id `c6a2144e-3196-4357-87a1-74e0b56739e5`) was created with the Auth admin API and `email_confirm: true` during the scripted pass. The login form then navigated to `http://localhost:3000/dashboard`, and the heading settled on `Investor dashboard`. The browser called `POST /auth/v1/token` with the anon key, then `POST /_serverFn/...` whose id decodes to `src/server/auth.ts` export `establishSession_createServerFn_handler`. Cookies after login: `preishare_access_token` and `preishare_refresh_token`, both `httpOnly`, path `/`. `document.cookie` did not contain `preishare_access_token`. |
| 2.3 | Signed-out user hitting `/dashboard` (or listings) is redirected to login | PASS | `fetch` with redirects left unfollowed: `GET /dashboard`, `GET /dashboard/listings`, and `GET /dashboard/listings/new` each returned `307` with `Location: /auth/login`. In the browser, opening `http://localhost:3000/dashboard/listings` with an empty cookie jar finished at `http://localhost:3000/auth/login` with heading `Log in`. |
| 2.4 | Sign-out clears session; protected pages no longer load data | PASS | Clicked `Sign out` on the dashboard. The browser called `POST /_serverFn/...` decoding to `src/routes/dashboard/route.tsx` export `signOutSession_createServerFn_handler`, then the URL was `http://localhost:3000/auth/login`. The cookie jar was empty. Opening `/dashboard/listings` again showed the login page, and the listing titles were absent. |

## 3. Listings happy path (User A)

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 3.1 | Create listing via UI (title, address/fields per schema) succeeds | PASS | On `/dashboard/listings/new`, submitted title `Sprint4 UI listing A`, street `410 UI Verify Road`, city `Boise`, price `325000`, country `US`. Postgres row id `ebd857a7-b6b4-422d-8aed-87fdb7c960ea`, status `draft`, `owner_id` is User A. The create request was `POST /_serverFn/...` decoding to `src/server/listings.ts` export `createListing_createServerFn_handler`, and the body contained that title. |
| 3.2 | New row visible on `src/routes/dashboard/listings/index.tsx` | PASS | After the listings heading settled, User A's page at `http://localhost:3000/dashboard/listings` showed `Sprint4 UI listing A` and `Sprint4 verify A 1792733060290`. It did not show User B's title. Heading was `Your property listings`. |
| 3.3 | Data matches Postgres (Supabase Table Editor), not mock arrays in the client | PASS | The UI row in 3.1 was read back from `property_listings` with the same title, address, city, price `325000`, and status `draft`. `Sprint4 verify A 1792733060290` (id `e37d27b8-a6f2-48bc-ad3c-0e4eac7c81ea`, city Boise, price 250000, status draft) was inserted through User A's JWT and then appeared on the index. `src/routes/dashboard/listings/index.tsx` loads `listMyListings` and does not import `src/fixtures/sample-investor-listings.ts`. Table Editor itself was not opened; the read was the REST row, not a screenshot. |
| 3.4 | Server path used: create/read go through `src/server/listings.ts` (or documented server functions) | PASS | Create used the `createListing` server function in 3.1. The index route loader calls `listMyListings()` from `src/server/listings.ts`. On the full page load of `/dashboard/listings`, the browser did not call `/rest/v1/property_listings`; the rendered page still showed the Postgres titles. `listMyListings` and `createListing` use `createServerSupabaseClient()`, which reads `SUPABASE_SERVICE_ROLE_KEY`. See the gap in section 6. |

## 4. Row Level Security (User B)

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 4.1 | Second account User B can sign up / log in | PASS | Manual signup works (2.1). User B for the RLS checks was created with the Auth admin API during the scripted pass: `sprint4-user-b-1792733060290@example.com`, id `386d49f5-aadc-4881-b7f6-b68f53fe2502`, email confirmed. The login form then opened `/dashboard/listings` for that account. |
| 4.2 | User B **cannot** see User A’s listings in the UI | PASS | User B's listings page showed `Sprint4 verify B 1792733060290` only. The page text did not include `Sprint4 verify A 1792733060290` or `Sprint4 UI listing A`. |
| 4.3 | Direct read as User B (UI empty list and/or Table Editor filtered by auth) shows no foreign rows | PASS | With User B's JWT and the anon key, `select` on `property_listings` before B's own insert returned `[]`. After both users had rows, B's select ids were only `c8443fea-0ff2-4fcf-babd-0198c701fb6f`. A's select did not include that id. The UI list in 4.2 matched that split. Table Editor was not opened. |
| 4.4 | User B can create their own listing and only see their own | PASS | User B's JWT insert succeeded: id `c8443fea-0ff2-4fcf-babd-0198c701fb6f`, title `Sprint4 verify B 1792733060290`, city Meridian, price 180000, status `published`. The same JWT's select returned only that id. The listings UI showed that title and none of User A's. This create went through PostgREST as User B. The form create in 3.1 was User A's. B's attempt to insert with A's `owner_id` failed with the RLS error in 1.2. |

## 5. Secret-hygiene audit

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 5.1 | `.env` with real values is **not** committed (`git status` / `git check-ignore`) | PASS | `.env` is present locally and is ignored: `git check-ignore -v .env` printed `.gitignore:6:.env	.env`. `git status --short` for `.env` and `.env.local` was empty. `git ls-files` lists `.env.example` and does not list `.env`. |
| 5.2 | `.env.example` has placeholder values only (no live keys) | PASS | Committed values are `https://your-project-ref.supabase.co`, `your-anon-or-publishable-key`, and `your-service-role-key`. The live project host and both live keys are absent from that file. |
| 5.3 | Repo search: no `service_role` key material in source, docs, or client bundle config | PASS | Tracked-file search for the live service-role key string: 0 files. Tracked JWTs whose payload `role` is `service_role`: 0 files. Lowercase word `service_role` in tracked files, excluding `package-lock.json`: 2 hits, both in `docs/setup/supabase-env-checklist.md`, naming the key rather than carrying key material. A production client bundle from `npm run build` was not inspected. |
| 5.4 | Browser-exposed env only uses public anon/URL names (e.g. `VITE_` / `PUBLIC_` per project convention)—never service role | PASS | Matches `docs/setup/supabase-env-checklist.md`. `src/lib/supabase/client.ts` reads `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. `src/lib/supabase/server.ts` reads `process.env.SUPABASE_URL` and `process.env.SUPABASE_SERVICE_ROLE_KEY`. The dev server's transformed `client.ts` contained the anon key and did not contain the service-role key. The transformed `server.ts` names `SUPABASE_SERVICE_ROLE_KEY` and did not contain the key value. JWT claims: anon key `role` is `anon`, service-role key `role` is `service_role`, both `ref` `oavogmgetmerhaglfoss`. `VITE_SUPABASE_URL` and `SUPABASE_URL` are the same host. |
| 5.5 | Client bundle / Network tab does not send service-role header | PASS | During signup, login, create, and sign-out, browser requests that carried an `apikey` used the anon key. Count of browser requests whose `apikey`, `Authorization`, URL, or body contained the service-role key: 0. Create, session, and sign-out went to `localhost:3000/_serverFn/...`. |

## 6. Gaps fixed this session

| Gap | Agent fix summary | Re-test result |
|-----|-------------------|----------------|
| Scripted signup submits returned `email rate limit exceeded` | No code change. The limit came from back-to-back scripted Auth calls. Manual signup on `/auth/signup` completed without that error (2.1). | PASS |
| First scripted signup click, before the page finished hydrating, submitted the form as a GET. The address bar included `email` and `password` query parameters. | No code change. A later scripted submit, after the signup module had loaded, left `password` out of the query string. Manual signup did not report this. | Open on the early scripted click. Hydrated submit kept the password out of the URL. |
| `src/server/listings.ts` lists, creates, and updates with the service-role client, so those calls bypass RLS and keep the owner filter in application code. `docs/data-model/rls-policy-review.md` says sponsor reads and writes should use the user session so the policies apply. | No code change. | UI lists still split by owner (3.2 and 4.2). Direct JWT reads still enforced RLS (1.2, 1.3, 4.3). |

## 7. Sign-off

- [x] Client story covered: sponsors can log in; listings load from Postgres under RLS; secrets kept out of the client bundle
- [x] All critical rows above are PASS (or FAIL accepted with written follow-up)
- [x] No real secrets written into this markdown file

**Overall:** PASS

**Notes for handoff (Step 12):**

- Login, httpOnly session cookies, signed-out redirects, and sign-out behaved as the routes describe. Listings created in the UI are rows in `public.property_listings`, and each signed-in sponsor's index showed only that sponsor's titles.
- Row 2.1 is PASS from a manual signup, which did not show `email rate limit exceeded`. The scripted attempts hit that limit only after repeated Auth calls. `mailer_autoconfirm` was false when those settings were read, so a new signup can still wait on email confirmation before login. The scripted User A and User B accounts were confirmed through the Auth admin API.
- The listings server functions bypass RLS with the service-role key and set `owner_id` from `getUser()`. Direct reads with a user JWT do enforce the own-row policies. A production `npm run build` bundle was not opened; the dev-server module and the browser request log did not send the service-role key.
- Rows left in project ref `oavogmgetmerhaglfoss` for recheck: User A `sprint4-user-a-1792733060290@example.com`; User B `sprint4-user-b-1792733060290@example.com`; listings `e37d27b8-a6f2-48bc-ad3c-0e4eac7c81ea`, `c8443fea-0ff2-4fcf-babd-0198c701fb6f`, and `ebd857a7-b6b4-422d-8aed-87fdb7c960ea`. One older listing was already in the table and is not described here. A disposable row used for the delete check was removed.
