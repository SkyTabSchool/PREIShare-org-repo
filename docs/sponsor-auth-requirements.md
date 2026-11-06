# PREIshare Sponsor Auth & Property Listings — Security Requirements

This file is the contract for sponsor sign-in and property listings.
It is written so a beginner can review an AI agent's work.
It names environment variables and what they are for.
It does not contain real keys, tokens, or connection strings.

## 1. Context

PREIshare sponsors need a real dashboard: they sign in securely, see only the
properties they are allowed to manage, and add new properties that belong to
them. Data lives in Postgres via Supabase. Secret keys must never ship to the
browser.

The app is TanStack Start + React. Listings must be rows in the database,
protected by policies. Hiding buttons in the interface is not protection.

Three ideas matter for every later step:

- **Supabase Auth** is how a sponsor signs in. After sign-in, the app has a
  **session**: proof of who they are. Protected pages must check that session
  on the server, not only in the browser.
- **Postgres** (the database Supabase hosts) stores property rows. A listing
  is real only if it is saved there and still there after a refresh.
- **Row-Level Security (RLS)** is a Postgres rule that decides which rows a
  signed-in person may read or write. With RLS on and no matching policy,
  the database denies the request.

A **service-role key** is a Supabase secret that bypasses RLS. Treat it like
a master key. A **public** (anon / publishable) key may appear in the browser
only because RLS and the session still limit what it can do. The public key
is not a secret, and it is not a substitute for RLS.

## 2. Actors

| Actor | Description | Signed in? |
| --- | --- | --- |
| Anonymous visitor | Anyone not logged in | No |
| Sponsor | Partner who manages their own listings | Yes (sponsor account) |
| Admin | Internal operator (out of scope this topic) | N/A this sprint topic |

"Sponsor account" means a Supabase Auth user. Stories below need that user's
id so each property row can name its owner. Extra profile fields are an open
question in section 8.

## 3. User stories (in scope)

1. As a **sponsor**, I can sign in with my credentials so the app knows who I am.
2. As a **sponsor**, I can see a list of **only my** properties after sign-in.
3. As a **sponsor**, I can create a new property that is owned by my account.
4. As an **anonymous visitor**, I can reach the login page but I cannot open the dashboard or change listings.

Sign-in for this topic is **email and password** (see section 8). "Only my
properties" means rows whose owner is the signed-in sponsor, enforced by RLS,
not by filtering a list in React after the database already returned everyone
else's rows.

## 4. Non-goals (out of scope this topic)

- Public (anonymous) create/update/delete of properties
- Full admin console or cross-sponsor moderation UI
- Putting the Supabase **service-role** (secret) key in any client/browser bundle
- Password-reset email polish, OAuth social login, or multi-factor auth (unless already provided by the starter)

## 5. Success criteria

- [ ] Sponsor can complete login and land on a protected dashboard route
- [ ] Unauthenticated users are blocked from dashboard/property routes
- [ ] Property list returns only rows the signed-in sponsor is allowed to see
- [ ] Property create associates the new row with the signed-in sponsor
- [ ] Browser-exposed config uses only public keys; secret keys stay server-only / env
- [ ] Database access for listings is enforced with Row-Level Security, not only UI hiding

## 6. Simple threat list

| Threat | What goes wrong | Requirement to mitigate |
| --- | --- | --- |
| Stolen or reused session | Attacker acts as the sponsor | Prefer server-checked session on protected routes; sign-out clears session |
| Guessing another sponsor’s property id | Attacker reads/edits someone else’s listing by id | RLS (and queries) must deny cross-sponsor access even if the id is known |
| Leaked service-role key | Attacker bypasses RLS with elevated API access | Never put service-role key in client code, git commits, or screenshots; use env on server only |
| “Security by hiding buttons” | UI hides edit controls but API still allows writes | Enforce rules in Postgres RLS + server paths, not only in React components |

## 7. Environment & secret hygiene notes (requirements only)

Document names and purpose only. Do not write real key values into this file,
into chat, into screenshots, or into git.

| Name | Public or secret | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Public (safe in the browser) | Supabase project URL. The `VITE_` prefix means Vite may include it in the client bundle. |
| `VITE_SUPABASE_ANON_KEY` | Public (safe in the browser when RLS is on) | Supabase anon / publishable key. It identifies the project. It must not bypass RLS. |
| `SUPABASE_URL` | Server-only (optional copy of the same project URL) | Same URL for server code that reads `process.env`. Not required in the browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret (server only) | Service-role key. Bypasses RLS. Read only from `process.env` on the server. |

Rules:

- **Public** variables may use the `VITE_` prefix and may be read in browser code.
- **Secret** variables must not use a `VITE_` (or other client) prefix, must not be imported into client components, and must not be committed.
- Real values belong in a local env file that git ignores (for example `.env`). A committed example file may list the names above with placeholders, never live keys.
- Sponsor reads and writes use the signed-in session so RLS still applies. Do not use the service-role key to "make listings work" in the browser.

Later steps will create `.env.example` and separate server and browser Supabase clients to match these rules.

## 8. Open questions for the team

- **Login method (decided for this topic):** email and password through Supabase Auth. Magic link, social OAuth, and multi-factor auth are out of scope unless the starter already provides them. Agents should not add those flows to satisfy the stories above.
- **`sponsors` profile table:** not required for the stories in section 3. Assumption until the data-model step says otherwise: the sponsor is the Supabase Auth user (`auth.users`), and each property row stores that user's id as its owner. A separate `sponsors` profile table is optional later if the team needs fields Auth does not store (display name, organization). Do not block login, list, or create on that table.

## 9. How later steps use this brief

This file is the contract for env separation, RLS policy design, login and
dashboard routes, property list and create flows, and the end-to-end security
verification checklist.

When reviewing agent output, check it against sections 5, 6, and 7 before
keeping a migration, a server client, or a login route:

- Protected routes reject anonymous visitors on the server.
- A property query cannot return or change another sponsor's row, even if the id is known.
- Create sets the owner from the signed-in session.
- The service-role key never appears in client code, `VITE_` variables, or a committed env file.
