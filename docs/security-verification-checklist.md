# Security verification checklist — PREIshare sponsor auth & properties

**Date:** 2026-11-06  
**Verifier:** Coding-agent re-run. Student sign-off is still blank.  
**Build / branch:** `main` at `3ef6816` plus uncommitted auth/session fixes (`src/routes/login.tsx`, `src/server/sponsor-session.ts`, `src/routes/dashboard/properties.tsx`, `src/routes/dashboard/properties.new.tsx`).  
**Related docs:** [docs/sponsor-auth-requirements.md](sponsor-auth-requirements.md), [docs/env-var-checklist.md](env-var-checklist.md), [docs/data-model-and-rls-matrix.md](data-model-and-rls-matrix.md)

Status values: `pass` | `fail` | `not-run`

This draft records what was actually checked on the re-run. Throwaway sponsors `seccheck-a-…` / `seccheck-b-…` were created for live checks and deleted afterward. No real key values are copied into this file.

---

## 1. Environment and secret hygiene

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 1.1 | Browser-safe client (`src/lib/supabase.client.ts`) uses only public URL + anon key | Re-opened the file. It calls `createClient` with `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY` only. No service-role import and no `process.env` read. | pass | |
| 1.2 | Service-role / secret key used only in server module (`src/lib/supabase.server.ts`) or never used in this topic | `SUPABASE_SERVICE_ROLE_KEY` is read only inside `createSupabaseServiceRoleClient` in `src/lib/supabase.server.ts`. Properties list/create call `createRequestSupabase()`, which builds an anon-key client and seeds it from httpOnly session cookies. | pass | Other server modules still call the service-role client: `src/server/listings.ts` and `src/lib/auth/session.ts` (session adopt/validate/sign-out). Those paths are outside the properties pages. See section 7. |
| 1.3 | No raw secrets committed in source or checklist | `git check-ignore` matches `.env` and `.env.local`. `git ls-files` does not track them. Tracked-file scan found the name `SUPABASE_SERVICE_ROLE_KEY` and placeholder text only; no live JWT payloads. | pass | No key values are copied into this checklist. |
| 1.4 | `.env.example` documents required vars without real values | Compared with `docs/env-var-checklist.md`. Both list `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`. Example values remain placeholders. | pass | |

**Section result:** pass

---

## 2. Login and session-aware routing

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 2.1 | Unauthenticated visit to dashboard (or properties) redirects or blocks access | HTTP GET with no cookies to `http://localhost:3000/dashboard`, `/dashboard/properties`, and `/dashboard/properties/new`. All responded `307` with `Location: /login`. | pass | Dev server listens on `localhost` (IPv6). `src/routes/dashboard.tsx` `beforeLoad` calls `readSponsorSession()` and redirects when the cookie session is missing. |
| 2.2 | Valid sponsor credentials reach an authenticated dashboard session | Browser sign-in at `/login` with throwaway sponsor A (`seccheck-a-…@example.com`). After submit, URL became `/dashboard` and the header showed that email. Network path: anon `signInWithPassword`, then `storeSponsorSession`, then navigate (no post-login `signOut`). | pass | Earlier loop was caused by `signOut({ scope: 'local' })` revoking the session after cookies were stored; that call was removed. |
| 2.3 | Invalid credentials do not grant dashboard access | Same email with a wrong password. Stayed on `/login` with alert `Invalid login credentials`. | pass | |
| 2.4 | Logout clears session; protected routes no longer load data as that user | Clicked **Sign out** on the dashboard. Landed on `/login`. Immediate navigation to `/dashboard/properties` redirected back to `/login`. | pass | Server path: `signOutSponsor()` → `signOut()` in `src/lib/auth/session.ts` (clears httpOnly cookies + admin sign-out). |

**Section result:** pass

---

## 3. Property list isolation (RLS)

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 3.1 | Signed-in sponsor sees property list UI from `src/routes/dashboard/properties.tsx` | While signed in as A, opened `/dashboard/properties`. Heading **Your properties** rendered with the signed-in email in the shell. | pass | |
| 3.2 | List shows only rows owned by the current sponsor (per docs/data-model-and-rls-matrix.md) | After A created a listing, A’s list showed only **Sponsor A Test Property**. Signed in as B: list was empty and did not include A’s title. Loader uses `createRequestSupabase()` with no owner filter; migration policy `listings_select_own` is `USING (owner_id = auth.uid())`. | pass | Also confirmed via anon-key client as B: `select` returned 0 rows. |
| 3.3 | Empty state is safe (no error that leaks other tenants’ data) | Before A created a listing, and again as B with no rows: UI showed static **No properties yet** copy with no alert and no other tenants’ titles. | pass | |

**Section result:** pass

---

## 4. Property create under RLS

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 4.1 | Create form on `src/routes/dashboard/properties.new.tsx` requires an authenticated session | Logged-out GET of `/dashboard/properties/new` → `307` `/login`. Signed-in A opened the form at `/dashboard/properties/new`. | pass | |
| 4.2 | Successful create inserts a row owned by the current sponsor | A submitted title/address/city/price/description. Navigated to `/dashboard/properties` showing **Sponsor A Test Property** / Orem / DRAFT. Admin read confirmed `owner_id` = A’s auth user id. | pass | Form does not send `owner_id`; handler sets it from `auth.getUser()`. |
| 4.3 | Create failure (validation or RLS) does not expose secret keys or raw DB internals in the UI | Submitted price `-5`. Stayed on the form with alert `Price must be zero or greater.` Body text had no `service_role` / service-role key material. | pass | Handler can still surface Postgres `error.message` on insert failure; that path was not hit this run. |

**Section result:** pass

---

## 5. Cross-sponsor access attempt

| # | Check | How you verified | Status | Notes |
|---|--------|------------------|--------|-------|
| 5.1 | Sponsor B cannot list Sponsor A’s properties in the UI | Signed in as B and opened `/dashboard/properties`. Empty state only; **Sponsor A Test Property** absent. Header email was B’s. | pass | |
| 5.2 | Direct read/update of another sponsor’s row is denied by RLS (UI and/or Supabase policy behavior) | As B with anon key + B’s session: `select` by A’s row id returned `null`; `update` returned no rows. Policy text in `supabase/migrations/20250321000000_property_listings.sql` still matches the matrix (`owner_id = auth.uid()`, no `anon` policy). Properties pages stay on `createRequestSupabase()` (anon + session), not service-role. | pass | |

**Section result:** pass

---

## 6. Gaps found and fixes applied

| Gap (checklist #) | What was wrong | Fix applied (files) | Re-test status |
|-------------------|----------------|---------------------|----------------|
| 2.2 (prior draft) | Post-login `supabaseBrowser.auth.signOut({ scope: 'local' })` revoked the session server-side, so cookies held a dead JWT and `/dashboard` redirected to `/login` | Removed that `signOut` from `src/routes/login.tsx`. Session store/read aligned on httpOnly `preishare_*` cookies via `storeSponsorSession` / `readSponsorSession` / `createRequestSupabase()` in `src/server/sponsor-session.ts` | pass (re-run 2.2) |

---

## 7. Residual risks (honest leftovers)

- `src/server/listings.ts` still lists/creates/updates with `createSupabaseServiceRoleClient()`, which bypasses RLS and filters `owner_id` in application code. `/dashboard/listings` uses that path. `/dashboard/properties` does not.
- `src/lib/auth/session.ts` uses the service-role client to verify JWTs, write/clear httpOnly cookies, and admin-sign-out. Properties data access still goes through the anon session client in `createRequestSupabase()`.
- A failed DB insert can still display `error.message` as-is (Postgres/RLS wording). Validation failure was exercised; an RLS insert denial was not forced in the UI.
- The service-role key remains available to server code through `process.env`. File review shows the browser client does not read it. A production bundle / deploy pipeline was not inspected this run.
- Auth fix files above are uncommitted on `main` at `3ef6816`; stakeholder demo should use a tree that includes those changes.

---

## 8. Stakeholder verdict

**Ready to show stakeholders?** yes, once the uncommitted login/session fixes are committed (or otherwise present in the demo branch)

**Summary:** Re-run passed env hygiene, logged-out redirects, valid/invalid login, logout, signed-in property list (including empty state), property create under the signed-in owner, validation error UI without secret leakage, and cross-sponsor list/read/update denial under RLS. Browser client still uses only `VITE_`* public values; properties pages use the anon session client. Leftover risk: older `/dashboard/listings` service-role path and uncommitted auth fixes.

**Sign-off:** student name Kory Anderson, date 11-06-26
