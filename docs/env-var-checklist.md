# Environment variable checklist

Review sheet for [sponsor-auth-requirements.md](sponsor-auth-requirements.md) section 7.
It names variables and what they are for.
It does not contain real keys, tokens, or connection strings.

Placeholders live in `[.env.example](../.env.example)`. Real values belong in a local `.env` that git ignores.

## Names


| Name                        | Public or secret                                    | Purpose                                                                                  | Placeholder in `.env.example`          |
| --------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------- |
| `VITE_SUPABASE_URL`         | Public (safe in the browser)                        | Supabase project URL. The `VITE_` prefix means Vite may include it in the client bundle. | `https://your-project-ref.supabase.co` |
| `VITE_SUPABASE_ANON_KEY`    | Public (safe in the browser when RLS is on)         | Supabase anon / publishable key. It identifies the project. It must not bypass RLS.      | `your-anon-or-publishable-key`         |
| `SUPABASE_URL`              | Server-only (optional copy of the same project URL) | Same URL for server code that reads `process.env`. Not required in the browser.          | `https://your-project-ref.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret (server only)                                | Service-role key. Bypasses RLS. Read only from `process.env` on the server.              | `your-service-role-key`                |




## How to fill a local env file

1. Copy `.env.example` to `.env`.
2. In the Supabase dashboard, open **Project Settings → API**.
3. Put the project URL in `VITE_SUPABASE_URL`. If server code reads `SUPABASE_URL`, put the same URL there.
4. Put the anon / publishable key in `VITE_SUPABASE_ANON_KEY`.
5. Put the service-role key in `SUPABASE_SERVICE_ROLE_KEY` only. Do not also put that key in any `VITE_` name.
6. Restart the dev server (`npm run dev`) after saving `.env`.

`.gitignore` ignores `.env` and `.env.*`, and keeps `.env.example` trackable. Do not commit `.env`. Do not paste the service-role key into chat, docs, screenshots, or a pull request.

## Rules

- **Public** variables may use the `VITE_` prefix and may be read in browser code.
- **Secret** variables must not use a `VITE_` (or other client) prefix, must not be imported into client components, and must not be committed.
- Sponsor reads and writes use the signed-in session so RLS still applies. Do not use the service-role key in the browser to make listings work.



## Review checks



### Example file

- [x] `.env.example` lists only the four names in the table above
- [x] Every value in `.env.example` is a placeholder, not a live key or a real project URL
- [x] This checklist and `.env.example` contain zero real key material



### Public vs secret

- [x] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` use the `VITE_` prefix
- [x] `VITE_SUPABASE_ANON_KEY` is the anon / publishable key, not the service-role key
- [x] `SUPABASE_URL` has no `VITE_` prefix
- [x] `SUPABASE_SERVICE_ROLE_KEY` has no `VITE_` prefix
- [x] The service-role key is not copied into any `VITE_` variable



### Where code may read them

- [x] Browser code reads only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (via `import.meta.env`)
- [x] Server code reads `SUPABASE_SERVICE_ROLE_KEY` from `process.env` only
- [x] No client component imports the service-role key
- [x] Listing reads and writes for a sponsor go through the signed-in session so RLS still applies



### Git

- [x] `git status` does not show `.env` as a file to add
- [x] A search of tracked files finds the name `SUPABASE_SERVICE_ROLE_KEY` only as a name, never a live key value