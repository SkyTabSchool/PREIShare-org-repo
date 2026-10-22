# RLS policy review — property_listings

## Migration file

- Path: `supabase/migrations/20250321000000_property_listings.sql`
- What it creates: table `public.property_listings`, indexes on `owner_id` and `status`, `updated_at` trigger (`property_listings_set_updated_at` via `public.set_updated_at()`), RLS enabled, and four own-row policies. Also creates the `pgcrypto` extension if it is missing so `gen_random_uuid()` is available.

## How to apply

1. Open Supabase Dashboard → SQL → New query
2. Paste the full migration contents
3. Run and confirm success. Run the file once. A second run fails on `create policy` because those policies already exist.
4. Table Editor → `property_listings` → confirm RLS enabled

## Policies (plain language)

Each policy is `to authenticated` only. The `anon` role has no policy. With RLS on, logged-out clients cannot read or write listings. There is no "read all published listings" policy.

| Policy | Operation | Who | Rule |
|--------|-----------|-----|------|
| `listings_select_own` | SELECT | authenticated | `owner_id = auth.uid()` |
| `listings_insert_own` | INSERT | authenticated | with check `owner_id = auth.uid()` |
| `listings_update_own` | UPDATE | authenticated | using + with check `owner_id = auth.uid()` |
| `listings_delete_own` | DELETE | authenticated | `owner_id = auth.uid()` |

SELECT returns only the signed-in sponsor's rows. INSERT rejects any `owner_id` other than that user. UPDATE can change only their rows and cannot reassign `owner_id`. DELETE removes only their rows. Sprint 4 UI success is create and read; update and delete policies are still in place so a later action cannot cross owners.

## Alignment with design doc

- Columns match [property-listings-schema.md](./property-listings-schema.md): yes. `owner_id` is `uuid not null` referencing `auth.users(id)` with `ON DELETE CASCADE`. Address uses `region` (not `state`). `address_line1`, `city`, and `country` are required; `country` defaults to `'US'`. `price` is `numeric(12,2) not null` with `price >= 0` (not nullable `price_cents`). `status` is `text` limited to `draft`, `published`, and `archived`, default `draft`. `created_at` and `updated_at` default to `now()`, and the trigger bumps `updated_at` on update.
- Missing policies: none. SELECT, INSERT, UPDATE, and DELETE each have an own-row policy for `authenticated`, matching section 4 of the schema doc.
- Overly open grants: none. No `USING (true)`, no policy for `anon` or `public`, and no world-readable catalog of published rows.

## Risks and open questions

- Should published listings be readable by other sponsors later? This sprint says no. Adding that would be a new SELECT policy, not a change to these own-row rules.
- Service role bypasses RLS. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only (`process.env`). Do not put it in `VITE_*`, browser code, or a committed env file. Sponsor reads and writes should use the user session so these policies still apply.
- Listing soft-delete (`deleted_at`) versus hard `DELETE` is still open in the schema doc. Auth-user removal already cascades. The delete policy allows a sponsor to hard-delete their own row.
- `status` default `'draft'` is not spelled out in the column table. It is one of the allowed values and matches a listing that has not been published yet.

## Sign-off

- Reviewed by: Kory Anderson
- Date: 2026-10-22
