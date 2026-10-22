# Supabase environment setup checklist (PREIshare Sprint 4)

## Purpose

Configure Supabase URL and keys for the TanStack Start dashboard so sponsors
can authenticate and listings can load from Postgres without shipping
service-role secrets to the browser.

## Source requirements

See [docs/requirements/sponsor-auth-and-listings-brief.md](../requirements/sponsor-auth-and-listings-brief.md)
(auth, listings, and secret-hygiene sections).

## Supabase project

- [x] Supabase project created (or selected) for PREIshare
- [x] Project URL copied from Project Settings → API
- [x] anon/public key copied
- [x] service_role key copied and stored only in a local untracked env file
- [x] Database password stored in a password manager (not in the repo)



## Repo files

- [x] `.env.example` committed with placeholder values only
- [x] Local `.env` or `.env.local` created from the example and filled with real values (do this yourself; do not paste the service-role key into chat or ask an agent to write it)
- [x] `.gitignore` includes `.env`, `.env.local`, and related env patterns (`.env.*`, with `.env.example` kept trackable)
- [x] `git status` does not list the real env file as untracked-to-add by mistake



## Public vs server-only rules

TanStack Start in this repo runs on Vite. `app.config.ts` does not set a custom
`envPrefix`, so the public prefix is `VITE_`. Client code reads
`import.meta.env.VITE_*`. Server routes and loaders read `process.env`.

- [x] Browser-safe vars use the template’s public prefix (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [x] `SUPABASE_SERVICE_ROLE_KEY` has NO public/client prefix
- [x] No file under `src/` that runs in the browser reads `SUPABASE_SERVICE_ROLE_KEY`
- [x] Checklist and example files contain zero real key material


| Name                        | Exposure                                            | Where it may be read                                       |
| --------------------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| `VITE_SUPABASE_URL`         | PUBLIC / browser-safe                               | Client bundle (`import.meta.env`) and server               |
| `VITE_SUPABASE_ANON_KEY`    | PUBLIC / browser-safe                               | Client bundle and server. Not a secret when RLS is on.     |
| `SUPABASE_URL`              | SERVER-ONLY (optional duplicate of the project URL) | `process.env` in server code only                          |
| `SUPABASE_SERVICE_ROLE_KEY` | SERVER-ONLY secret                                  | `process.env` in server routes/loaders only. Bypasses RLS. |




## Smoke checks before feature work

- [x] Restart the dev server after creating or editing the local env file
- [x] App still starts (env typos often surface as empty URL/key errors later)
- [x] Search the repo for the service_role key string — zero hits in tracked files



## Handoff notes

- Hosting providers need the same split: public vars for the client build, service-role only in server/runtime secret storage.
- Next steps (later in this sprint): data model, migrations/RLS, then Supabase clients that read these env names.

