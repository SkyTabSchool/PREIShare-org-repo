# PREIshare — Data model and RLS policy matrix

## Purpose

Design-only blueprint for sponsor auth and property listings.
Step 6 migrations must follow this document. Do not add tables or policies that this file does not name. Update this file first if the set of tables or policies changes.

Consumed from: [docs/sponsor-auth-requirements.md](../sponsor-auth-requirements.md).

The listings table already exists as `public.property_listings` in [supabase/migrations/20250321000000_property_listings.sql](../../supabase/migrations/20250321000000_property_listings.sql). This blueprint keeps that name and those columns. It does not add a second listings table. The new table for Step 6 is `public.profiles`.

## Actors and identities

| Actor | How identity is established | Notes |
| --- | --- | --- |
| Anonymous visitor | No Supabase session | Must not read or write sponsor profiles or listings |
| Sponsor (authenticated) | Supabase Auth user; `auth.uid()` is their user id | May manage only rows they own |
| Service role / server admin tasks | Secret service-role key on the server only | Bypasses RLS. Not used from the browser. Out of band for normal sponsor UI |

## Tables

### `profiles` (sponsor linkage)

Links one Supabase Auth user to sponsor display data. One profile row per auth user.

| Column | Type (intent) | Required | Notes |
| --- | --- | --- | --- |
| `id` | `uuid` (PK, FK → `auth.users.id`) | yes | Same value as `auth.uid()`. `ON DELETE CASCADE` so the profile disappears with the auth user |
| `display_name` | `text` | yes | Shown in dashboard chrome. Email stays on `auth.users` |
| `created_at` | `timestamptz` | yes | Default `now()` |

`profiles` is not the ownership hinge. Login, list, and create must still work when this row is missing. See the open question on when the row is inserted.

### `property_listings` (listings owned by a sponsor)

This is the properties table. `owner_id` references `auth.users(id)`, not `profiles.id`, so a sponsor can create a listing before a profile row exists. The id is still the same uuid as `profiles.id` and `auth.uid()`.

| Column | Type (intent) | Required | Notes |
| --- | --- | --- | --- |
| `id` | `uuid` (PK) | yes | Default `gen_random_uuid()` |
| `owner_id` | `uuid` (FK → `auth.users.id`) | yes | **RLS hinge.** `ON DELETE CASCADE`. Policies compare it to `auth.uid()` |
| `title` | `text` | yes | Listing title |
| `description` | `text` | no | Longer copy |
| `address_line1` | `text` | yes | Street address |
| `city` | `text` | yes | |
| `region` | `text` | no | State or province |
| `postal_code` | `text` | no | |
| `country` | `text` | yes | Default `'US'` |
| `price` | `numeric(12,2)` | yes | Check `price >= 0` |
| `status` | `text` | yes | Check: `draft`, `published`, `archived`. Default `draft` |
| `created_at` | `timestamptz` | yes | Default `now()` |
| `updated_at` | `timestamptz` | yes | Default `now()`. Bump on update via `set_updated_at()` |

Indexes already in the migration: primary key on `id`, index on `owner_id`, index on `status`.

## RLS posture

- Enable RLS on `profiles` and `property_listings` before any client relies on the API.
- No policy means no access. The `anon` role has no policy on either table.
- No `USING (true)` policy for `authenticated` on `property_listings`.
- No policy that lets every authenticated user read every listing.
- Browser clients use the anon key plus the sponsor session. The service-role key stays in server `process.env` and is not a sponsor RLS policy. Sponsor list and create should run as the signed-in user so these policies apply.
- The request body must not choose `owner_id` or `profiles.id`. The server sets both from the session. Insert `WITH CHECK` rejects any other value.

## RLS policy matrix

| Table | Operation | Who | Rule (plain English) | Intended SQL shape (for Step 6) |
| --- | --- | --- | --- | --- |
| `profiles` | SELECT | Authenticated sponsor | Can read own profile only | `to authenticated` `USING (id = auth.uid())` |
| `profiles` | INSERT | Authenticated sponsor | Can create own profile row only | `to authenticated` `WITH CHECK (id = auth.uid())` |
| `profiles` | UPDATE | Authenticated sponsor | Can update own profile only, and cannot change `id` | `to authenticated` `USING (id = auth.uid())` and `WITH CHECK (id = auth.uid())` |
| `profiles` | DELETE | Sponsor | Denied this sprint | No policy |
| `property_listings` | SELECT | Authenticated sponsor | Can read only listings they own | Policy `listings_select_own`: `to authenticated` `USING (owner_id = auth.uid())` |
| `property_listings` | INSERT | Authenticated sponsor | Can insert only when they are the owner | Policy `listings_insert_own`: `to authenticated` `WITH CHECK (owner_id = auth.uid())` |
| `property_listings` | UPDATE | Authenticated sponsor | Can update only owned rows, and cannot reassign `owner_id` | Policy `listings_update_own`: `USING (owner_id = auth.uid())` and `WITH CHECK (owner_id = auth.uid())` |
| `property_listings` | DELETE | Authenticated sponsor | Can hard-delete only owned rows | Policy `listings_delete_own`: `USING (owner_id = auth.uid())`. See open question if the team switches to archive-only |
| `profiles`, `property_listings` | ALL | Anonymous | No access | No policy for `anon` |

The four `property_listings` policies are already in the Sprint 4 migration. Step 6 adds the `profiles` policies. It does not replace the listing policies unless this matrix changes first.

## Requirement → design mapping

| Requirement (from sponsor-auth-requirements) | Satisfied by |
| --- | --- |
| Sponsor account is a Supabase Auth user | `profiles.id` and `property_listings.owner_id` both store `auth.users.id` |
| Sponsor signs in before managing listings | Dashboard session check, plus RLS: no `anon` policy on either table |
| Sponsor sees only their properties | `listings_select_own`: `owner_id = auth.uid()` |
| Sponsor creates a listing they own | Server sets `owner_id` from the session. `listings_insert_own` `WITH CHECK (owner_id = auth.uid())` |
| Guessing another sponsor’s listing id still fails | Same `owner_id = auth.uid()` policies on SELECT, UPDATE, and DELETE |
| Listing fields for dashboard cards | `title`, `city`, `status`, `price`, `created_at` on `property_listings` |
| Profile fields Auth does not store | `profiles.display_name`. Listing stories do not require this row |
| Secrets stay off the client | Service role is not a browser policy. Anon key plus session is the sponsor path |

## Out of scope this sprint

- A second table named `properties`. Listings stay on `property_listings`.
- Public marketplace read of `published` listings. That would be a new SELECT policy, added here before any migration.
- Multi-sponsor or team ownership of one listing.
- Admin override UI. Service role stays on the server and is not granted through a sponsor policy.
- Sponsor DELETE on `profiles`.
- Copying email, password, or other Auth secrets onto `profiles`.

## Open questions for review

- [ ] Confirm hard DELETE (`listings_delete_own`) versus archive-only (`status = 'archived'` and no DELETE policy). The migration currently allows both: sponsors can set `archived` and can hard-delete their own row.
- [ ] Confirm whether the `profiles` row is created by a trigger on signup or by the app on first login. Until that is decided, listing create must not wait on `profiles`.

## Ready for Step 6 when

- [ ] Every sponsor-facing action in the requirements maps to a matrix row.
- [ ] `owner_id` is the listing hinge and references `auth.users.id`.
- [ ] `profiles.id` is the same auth user id and is not required to insert a listing.
- [ ] No policy grants all authenticated users access to all listings.
- [ ] Step 6 adds `profiles` and its three policies, and leaves the existing `property_listings` policies in place.
