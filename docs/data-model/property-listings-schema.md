# Property Listings Data Model & Auth Boundaries

> Sprint 4 design doc for PREIshare. Source of truth for migrations and RLS.
> Inputs: [docs/requirements/sponsor-auth-and-listings-brief.md](../requirements/sponsor-auth-and-listings-brief.md),
>         [docs/setup/supabase-env-checklist.md](../setup/supabase-env-checklist.md)

## 1. Purpose

Sponsors sign in and manage **real** property listings stored in Postgres.
The brief’s product contract for this sprint is: register and log in, keep
listing pages behind a session, **create and read listings that belong to the
signed-in sponsor**, and keep privileged secrets on the server.

No mock arrays in the browser for listing data. A created listing must persist
in Postgres and still be there after refresh. Fixtures such as
`src/fixtures/sample-investor-listings.ts` may stay for types and tests; a
listing route must not load them. This sprint does not, by itself, replace the
existing investor mock pages (portfolio, deals, profile).

Secrets never ship to the client. The service-role key bypasses RLS and is
server-only. The anon key is client-safe only because RLS and a session check
still apply; it is not a bypass.

## 2. Entity: `property_listings`

Fields for the sponsor-owned listing row. The brief does not name columns; this
table is the proposed Sprint 4 shape for create-and-read.

| Column | Type (Postgres) | Nullable | Notes |
|--------|-----------------|----------|-------|
| `id` | `uuid` | no | Primary key; default `gen_random_uuid()` |
| `owner_id` | `uuid` | no | FK → `auth.users(id)`; the sponsor who owns the row |
| `title` | `text` | no | Short display name |
| `description` | `text` | yes | Longer listing copy |
| `address_line1` | `text` | no | Street address |
| `city` | `text` | no | |
| `region` | `text` | yes | State / province |
| `postal_code` | `text` | yes | |
| `country` | `text` | no | Default `'US'`. The brief does not specify a country; see open questions |
| `price` | `numeric(12,2)` | no | Asking or share price; check constraint `price >= 0` |
| `status` | `text` | no | Check constraint: `draft`, `published`, `archived` |
| `created_at` | `timestamptz` | no | Default `now()` |
| `updated_at` | `timestamptz` | no | Default `now()`; bump on update |

### Indexes (recommended)

- Primary key on `id`
- Index on `owner_id` (filter "my listings")
- Optional index on `status` if dashboards filter by published/draft often

### Out of scope for this sprint

- Images / media tables
- Full-text search / pgvector embeddings (later sprint)
- Multi-sponsor shared ownership
- Payment processing, document uploads, full admin roles, and social OAuth
  beyond Supabase email auth (deferred by the brief)
- Replacing investor mock pages that are not the listing create/read flow

## 3. Ownership model

- Every listing row **must** have `owner_id` set to the Supabase Auth user id
  of the sponsor who created it.
- `owner_id` references `auth.users(id)` with **`ON DELETE CASCADE`**.
  The brief has no soft-delete or retained-history rule. If the auth user is
  removed, their listing rows go with them so the table cannot keep orphans
  that no sponsor can see under the own-row policies below. Listing-level
  soft-delete (`deleted_at`) is a separate decision and is still open.
- Application code never lets a client supply a different `owner_id` than the
  signed-in user on insert. The server sets `owner_id` from the session.
  The insert policy’s `WITH CHECK` rejects any other value.

A sponsor can create a listing and read the listings they own. Unauthenticated
visitors reach login and signup only and cannot see listing data. This sprint’s
success criteria do not require update or delete in the UI; the policies in
the next section still close those commands to the owning sponsor so a later
action cannot cross owners.

## 4. Proposed Row Level Security (RLS) — plain language

Enable RLS on `property_listings`. No policy means no access.

| Policy name (suggested) | Command | Who | Rule |
|-------------------------|---------|-----|------|
| `listings_select_own` | SELECT | authenticated | `owner_id = auth.uid()` |
| `listings_insert_own` | INSERT | authenticated | `WITH CHECK (owner_id = auth.uid())` |
| `listings_update_own` | UPDATE | authenticated | `USING (owner_id = auth.uid())` and `WITH CHECK (owner_id = auth.uid())` |
| `listings_delete_own` | DELETE | authenticated | `USING (owner_id = auth.uid())` |

Notes:

- Anonymous (logged-out) users get **no** listing access in this sprint. The
  brief says an unauthenticated visitor cannot see listing data, and a sponsor
  only sees their own rows.
- Do **not** add a public "read all published listings" policy. The brief does
  not ask for a world-readable catalog.
- The service-role key bypasses RLS. It is only for server admin or maintenance
  tasks. Never put it in browser code, a `VITE_*` variable, or a committed env
  file. The anon / publishable key does not replace these policies or a
  session check.

## 5. Server vs browser operation map

Reads and writes that depend on the signed-in sponsor go through TanStack
Start server functions (`createServerFn` or another server-only helper), using
a Supabase client that carries that user’s session so RLS still applies.

| Operation | Runs where | Client type | Notes |
|-----------|------------|-------------|-------|
| Sign up / sign in / sign out | Browser + Supabase Auth | Browser (anon/public key + user session) | Email/password or equivalent Supabase Auth. No service-role |
| Session check for protected routes | Server loader / middleware | Server Supabase client with the user session | Dashboard routes that show listings require a session. Redirect if there is none |
| List my listings | Server loader | Server client as the user (RLS applies) | Returns only rows this sponsor owns. Data comes from Postgres, not a client mock array |
| Create listing | Server action | Server client as the user; set `owner_id` from the session | Validate fields server-side. Row must still be readable after refresh |
| Update / archive listing | Server action, if added later | Server client as the user | Not a Sprint 4 success criterion. RLS blocks cross-owner edits |
| Admin bulk jobs (out of scope) | Server only | Service-role | Brief defers full admin roles. Never import the service-role key into a client bundle |

### Environment boundary reminder

From the env checklist. Names only; do not put real values in this doc.

| Name | Exposure | Where it may be read |
|------|----------|----------------------|
| `VITE_SUPABASE_URL` | Public / browser-safe | Client bundle (`import.meta.env`) and server |
| `VITE_SUPABASE_ANON_KEY` | Public / browser-safe | Client bundle and server. Not a secret when RLS is on |
| `SUPABASE_URL` | Server-only (optional duplicate of the project URL) | `process.env` in server code only |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only secret. Bypasses RLS | `process.env` in server routes and loaders only |

Also server-only, and never in client code, `VITE_*` variables, the browser
bundle, or a committed `.env`:

- Any other privileged secret
- Direct privileged database URLs, if used outside Supabase client helpers
- The database password (password manager, not the repo)

## 6. Acceptance checks for the next (migration) step

- [ ] Table `property_listings` matches the column list above
- [ ] `owner_id` foreign key to `auth.users` with `ON DELETE CASCADE`
- [ ] `price >= 0` and `status` limited to `draft`, `published`, `archived`
- [ ] RLS enabled with own-row SELECT, INSERT, UPDATE, and DELETE policies
- [ ] No policy grants anonymous or world-readable access
- [ ] Migration file is the only place SQL is introduced — not ad-hoc dashboard clicks without a recorded migration
- [ ] Listing create and list paths read and write Postgres through a server function as the signed-in user
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is absent from client bundles and from git

## 7. Open questions (resolve before or during migration)

- Default `country` value if sponsors are multi-country. `'US'` is the proposed default because the brief is silent.
- Whether `status` should be a Postgres enum or stay `text` plus a check constraint. This doc proposes `text` plus a check so later values can be added in a normal migration.
- Soft-delete (`deleted_at`) versus hard `DELETE` for a listing the sponsor removes. Auth-user removal is already `ON DELETE CASCADE`; that does not decide the in-app delete behavior.
- Whether address columns should later be split into the nested address group used by the investor-listing types. This sprint stores them as columns on `property_listings`.
