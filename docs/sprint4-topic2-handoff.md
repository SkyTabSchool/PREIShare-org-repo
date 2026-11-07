# Sprint 4 Topic 2 Handoff — PREIshare Sponsor Auth & Protected Listings

Handoff for the next learner or agent continuing sponsor auth and protected property work.

**Give the agent these four docs as context first** (paths under the repo root; attach file contents if the agent cannot read the tree):

| Doc | Path | Purpose |
| --- | --- | --- |
| Requirements | `docs/sponsor-auth-requirements.md` | Who can see/change what; env hygiene contract |
| Data model & RLS | `docs/data-model-and-rls-matrix.md` | Tables, keys, policy matrix |
| Env checklist | `docs/env-var-checklist.md` | Public vs secret vars; local setup |
| Security verification | `docs/security-verification-checklist.md` | What was tested, residual risks, sign-off |

Do not change auth, RLS, or Supabase clients without reading those four documents.

---

## Client outcomes

- Sponsors can sign in through the app login path (`/login`, email/password via Supabase Auth) and reach a session-aware dashboard.
- Property list and create flows on `/dashboard/properties` and `/dashboard/properties/new` run under Postgres Row-Level Security so a sponsor only sees and creates their own `property_listings` rows (`owner_id = auth.uid()`).
- Public Supabase URL / anon key stay client-safe (`VITE_SUPABASE_*`). The service-role (secret) key is used only on server-only code paths and is never shipped in the browser bundle.
- Unauthenticated visitors can open login but are redirected away from dashboard and property routes (server `beforeLoad` session check).

---

## Architecture decisions

**Why we built it this way** (aligned to the requirements and RLS matrix):

- **Auth**: Supabase Auth sessions drive access to dashboard routes. Session proof is stored/read via httpOnly cookies on the server (`storeSponsorSession` / `readSponsorSession`). Unauthenticated users are sent to `/login`. Do not rely on hiding UI alone.
- **Data**: Tables are `profiles` (optional sponsor display linkage) and `property_listings` (listings owned by `auth.users.id` via `owner_id`). RLS is enabled; policies match the matrix in `docs/data-model-and-rls-matrix.md`. There is no separate `sponsors` / `properties` table pair for this topic—listings stay on `property_listings`.
- **Clients**: Browser-safe client (`src/lib/supabase.browser.ts`) vs server modules (`src/lib/supabase.server.ts`, `src/server/sponsor-session.ts`) keeps secret keys out of client code. Sponsor property list/create use `createRequestSupabase()` (anon key + session cookies) so RLS still applies. Do not use the service-role key in the browser to “make listings work.”
- **Env hygiene**: Variable names and public/secret rules are documented in `.env.example` and `docs/env-var-checklist.md`. Real values live in a gitignored `.env`. Secrets are not committed and must never use a `VITE_` prefix.

---

## File map

### Source documents (read first)

| Path | Role |
| --- | --- |
| `docs/sponsor-auth-requirements.md` | Security requirements contract |
| `docs/data-model-and-rls-matrix.md` | Schema + RLS policy design |
| `docs/env-var-checklist.md` | Env names and review checks |
| `docs/security-verification-checklist.md` | Verification results and residual risks |

### Clients and session

| Path | Role |
| --- | --- |
| `src/lib/supabase.browser.ts` | Browser-safe Supabase client (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` only; not named `*.client.ts` so SSR routes can import it) |
| `src/lib/supabase.server.ts` | Server clients: session-aware anon client helpers + `createSupabaseServiceRoleClient()` |
| `src/server/sponsor-session.ts` | `createServerFn` wrappers for read/store/sign-out (safe to import from routes) |
| `src/server/sponsor-session.server.ts` | `createRequestSupabase()` for RLS-bound property routes (server-only) |
| `src/lib/auth/session.server.ts` | Session adopt / validate / sign-out (uses service-role for JWT verify and admin sign-out) |

### Routes

| Path | Role |
| --- | --- |
| `src/routes/login.tsx` | Sponsor login (email/password) |
| `src/routes/dashboard.tsx` | Session-aware dashboard shell; redirects when session missing |
| `src/routes/dashboard/properties.tsx` | Protected property list under RLS |
| `src/routes/dashboard/properties.new.tsx` | Create listing under RLS (`owner_id` from session, not the form body) |

### Schema and RLS

| Path | Role |
| --- | --- |
| `supabase/migrations/20250321000000_property_listings.sql` | `property_listings` table + listing RLS policies |
| `supabase/migrations/20250321000000_sponsors_properties_rls.sql` | `profiles` table + profiles RLS; reasserts listing policies |

### Related (not the RLS-bound properties path)

| Path | Role |
| --- | --- |
| `src/server/listings.ts` | Older listings server API using **service-role** (bypasses RLS; filters `owner_id` in app code) |
| Dashboard listings UI under `/dashboard/listings` | Consumes the service-role path above; distinct from `/dashboard/properties` |

---

## Known limitations

Do not claim “done” for items that remain open or only partially mitigated. From `docs/security-verification-checklist.md` (re-run 2026-11-06): sections 1–5 recorded **pass**, with honest leftovers in section 7.

### Residual risks from verification (still open / incomplete)

- **`/dashboard/listings` still bypasses RLS**: `src/server/listings.ts` uses `createSupabaseServiceRoleClient()` and filters ownership in application code. `/dashboard/properties` does **not** use that path; treat the older listings route as a leftover, not the model to copy.
- **Service-role still used for session plumbing**: `src/lib/auth/session.server.ts` uses the service-role client to verify JWTs, write/clear httpOnly cookies, and admin-sign-out. Properties data access still goes through the anon session client in `createRequestSupabase()`.
- **Insert error UI can surface Postgres wording**: A failed DB insert may display `error.message` as-is. Validation failure was exercised; an RLS insert denial was not forced in the UI during verification.
- **Production bundle / CI not inspected**: File review showed the browser client does not read the service-role key; a production bundle or deploy pipeline was not checked on that run.
- **Commit state at verification**: Auth/session fixes on login and property routes were noted as uncommitted relative to `main` at `3ef6816`. Confirm the demo/PR branch includes those changes before stakeholder review.

### Product / scope limits (by design for this topic)

- Listing fields are those on `property_listings` (title, address, city, price, status, etc.); richer PREIshare metadata is out of scope for this topic.
- Sponsor invites / multi-user orgs / team ownership of one listing are not implemented.
- Public marketplace read of `published` listings is not implemented (would need a new SELECT policy documented in the matrix first).
- Admin console and cross-sponsor moderation UI are out of scope.
- CI/CD secret injection (GitHub Actions secrets) is recommended next, not completed here.
- Open design questions still noted in the data-model doc: hard DELETE vs archive-only for listings; when/how `profiles` rows are created (listing create must not wait on `profiles`).

---

## Recommended next work

1. Richer property listing fields and validation aligned to PREIshare product needs (update the data-model doc before migrations).
2. Sponsor invite or role model if more than one person manages a sponsor account.
3. CI secret injection and deploy-time env checks so production never uses committed secrets; optionally inspect the production bundle for accidental secret leakage.
4. Automated tests for RLS isolation (sponsor A cannot read or update sponsor B rows), including a forced RLS denial path in the create UI.
5. Retire or harden the older `/dashboard/listings` service-role path so sponsor data access consistently uses session + RLS like `/dashboard/properties`.

---

## Handoff checklist for the next learner

- [ ] Read the four source docs above before changing auth or RLS.
- [ ] Confirm local `.env` matches `.env.example` names; never commit real secret values.
- [ ] Re-run `docs/security-verification-checklist.md` after any policy or client change.
- [ ] Keep service-role usage server-only; prefer anon + session (`createRequestSupabase()`) for sponsor list/create so RLS applies.
- [ ] Prefer `/dashboard/properties` patterns over copying `/dashboard/listings` service-role queries.
- [ ] Update `docs/data-model-and-rls-matrix.md` before adding tables or policies.
