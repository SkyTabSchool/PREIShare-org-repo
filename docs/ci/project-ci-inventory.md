# PREIshare dashboard — CI project inventory

## Purpose
List what this repo can run automatically on a GitHub-hosted runner for pull requests,
what needs secrets or external services, and what stays human. Downstream pipeline
design must use only real package-manager and script names found here.

## Repo facts (fill from the real project)
- Package manager: **npm** (not pnpm, not yarn). `README.md` says to install from `package-lock.json`. `package.json` contains a `pnpm.onlyBuiltDependencies` block, and there is no `pnpm-lock.yaml`.
- Lockfile present: **`package-lock.json`** (`lockfileVersion` 3, package name `preishare-investor-dashboard`). No `pnpm-lock.yaml`. No `yarn.lock`.
- Node/TypeScript app signals: `package.json` (`"type": "module"`), `tsconfig.json`, `tsconfig.typecheck.json`, `app.config.ts`, `src/`. No `engines` field and no `.nvmrc` or `.node-version`.
- Framework signals: React 19 and TanStack Start. `package.json` depends on `react`, `react-dom`, `@tanstack/react-start`, `@tanstack/react-router`, and `vite`. `app.config.ts` wires `tanstackStart({ srcDirectory: 'src' })`, the React plugin, Tailwind, and Nitro. Routes live under `src/routes/` (file-based). `README.md` describes the investor dashboard shell.
- Test runner (if any): **none found**. No `test` script. No `vitest`, `jest`, or Playwright config. No `*.test.ts` / `*.spec.ts` files.
- Lint tool (if any): **none found**. No `lint` script. No ESLint (or other linter) config or dependency. `src/routeTree.gen.ts` has an `eslint-disable` comment only.

## Scripts discovered in package.json
| Script name | Exact command (from package.json) | Role |
|-------------|-------------------------------------|------|
| `dev` | `vite dev --port 3000 --config app.config.ts` | local dev server (not a CI check) |
| `generate-routes` | `tsr generate` | regenerate `src/routeTree.gen.ts` |
| `build` | `vite build --config app.config.ts` | build |
| `preview` | `vite preview --config app.config.ts` | local preview server (not a CI check) |
| `typecheck` | `tsc --noEmit -p tsconfig.typecheck.json` | typecheck |

There is no `install` script. Lockfile install is the npm command `npm ci` (local cold start in `README.md` is `npm install`).

Missing common checks (write MISSING if not present):
- typecheck: present — `npm run typecheck`
- build: present — `npm run build`
- lint: **MISSING**
- test: **MISSING**

`npm run typecheck` completed with exit 0 on a clean use of the existing install. `npm run build` also completed with exit 0 while `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `EMBEDDING_API_KEY` were blank. The production build does not call Supabase. Loading the browser client at runtime still throws if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing (`src/lib/supabase.browser.ts`).

## Bucket A — Headless-safe on GitHub-hosted runners
Checks that need only a clean checkout, the lockfile install, and public tooling.
For each item: script name, why it belongs in PR CI, rough order (install → typecheck → lint → test → build or as fits this repo).

Lint and test are omitted because those scripts do not exist. A workflow must not call `npm run lint` or `npm run test`.

1. **Install — `npm ci`.** Uses `package-lock.json` on a clean runner. Answers the pain that teammates otherwise have to remember a local install. Runs first. (`npm install` is the README local command; `npm ci` is the lockfile install for CI.)
2. **Typecheck — `npm run typecheck`** (`tsc --noEmit -p tsconfig.typecheck.json`). Fails the pull request when TypeScript rejects the change. Needs the install. Does not need Supabase env. Runs second.
3. **Build — `npm run build`** (`vite build --config app.config.ts`). Proves the TanStack Start / React dashboard still builds. Needs the install. Does not need secrets to finish the compile (verified with those env names blank). Runs third.

Leave these scripts off the required PR job:

- `dev` and `preview` start long-running servers.
- `generate-routes` (`tsr generate`) rewrites `src/routeTree.gen.ts`. It does not need secrets, and it is not a pass/fail gate. Do not run it as a required check unless the team later adds an explicit drift check.

Order for the first workflow: **`npm ci` → `npm run typecheck` → `npm run build`**. Stop on the first failure.

## Bucket B — Needs secrets, env, or external services
Do **not** put these in the first PR CI job unless the team later adds protected secrets and a safe plan.
Examples to verify against this repo: Supabase URL/keys, database URLs, private package tokens.

No private package registry is referenced. npm dependencies install from the public registry via `package-lock.json`.

| Check or step | Why it is not headless-safe | What would be required later |
|---------------|-----------------------------|------------------------------|
| Sign-in, listings, property create, and search against Supabase | Server helpers throw when URL or keys are missing (`src/lib/supabase.server.ts`, `src/server/sponsor-session.server.ts`). Search embeddings need `EMBEDDING_API_KEY` (`src/lib/embeddings/generate.ts`). These paths talk to a live project. | Protected GitHub secrets for the env names below, a non-production Supabase project, and a decision that PR CI may call it. |
| `npx tsx --env-file=.env scripts/seed-property-embeddings.ts` | Not a `package.json` script. Header requires `EMBEDDING_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_URL` (or `VITE_SUPABASE_URL`). Writes rows and calls an embedding provider. `tsx` is not a declared dependency. | A seed script in `package.json`, `tsx` as a devDependency, secrets, and a disposable database. Keep it out of PR CI. |
| Applying `supabase/migrations/*.sql` | SQL files are in the repo (`enable_pgvector_properties`, `match_properties_function`, `property_listings`, `sponsors_properties_rls`). No npm script or Supabase CLI config runs them. Applying them needs a database URL and should not target production from a pull request. | A documented, non-production database and a human or a later job with a guarded secret. |
| `npm run dev` / `npm run preview` | Local servers. Preview of a real session needs the public Supabase names at runtime, and the browser client throws if they are absent. | Local `.env` from `.env.example`. Not a PR status check. |
| Any step that reads `SUPABASE_SERVICE_ROLE_KEY` | Bypasses Row Level Security. `.env.example` marks it server-only. | Protected secret, server-only job, never a `VITE_` name, never the first PR workflow. |

## Bucket C — Human judgment (not a green checkmark)
Items CI must not pretend to decide: product intent, UX quality, security-sensitive design,
"should we merge", AI review suggestions that still need a person.

- Approve the pull request, request changes, or merge. A green `typecheck` and `build` is evidence that those commands passed. It is not permission to merge.
- Product and UX of the investor dashboard (Home, Portfolio, Deals, Profile, listings, search): copy, layout, empty states, and whether the flow matches the sprint brief.
- Security-sensitive design: where the service-role key is used, whether sponsor reads and writes go through the user session so RLS applies, and whether secrets stay out of `VITE_` names and the client bundle.
- Data handling: seed data, embeddings, and migrations change investor or listing data. A person decides whether that change is appropriate.
- AI review comments. They can speed reading. A person remains accountable for the decision.
- Adding lint or tests later. Choosing the tool and what “good” means is a team decision. This inventory does not invent `eslint` or `vitest` scripts.

## Supabase / env caveats for CI
- Env var **names** referenced by the app or `.env.example` (values never committed):
  - In `.env.example`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `EMBEDDING_API_KEY`.
  - Also read in server code, with a `VITE_` fallback when noted: `SUPABASE_ANON_KEY` (fallback `VITE_SUPABASE_ANON_KEY` in `src/lib/supabase.server.ts` and `src/server/sponsor-session.server.ts`). Optional: `EMBEDDING_MODEL`, `EMBEDDING_API_URL` (`src/lib/embeddings/generate.ts`). `NODE_ENV` is used for the session cookie `secure` flag.
- Local-only or dashboard-only steps (migrations against prod, manual SQL, etc.):
  - Copy `.env.example` to `.env` and fill values in the Supabase dashboard (Project Settings → API). `.env` and `.env.*` are gitignored.
  - `npm run dev` and `npm run preview`.
  - `npx tsx --env-file=.env scripts/seed-property-embeddings.ts`.
  - Applying files under `supabase/migrations/` by hand or against a hosted database. Do not point that at production from PR automation.
- Recommendation for Sprint 6 PR CI: **keep the first pipeline on Bucket A only** — `npm ci`, then `npm run typecheck`, then `npm run build`. Do not add lint or test until those scripts exist in `package.json`. Do not add Supabase, embeddings, seed, or migrations.

## Risks and open questions
- Multiple lockfiles? No. Only `package-lock.json`. The `pnpm` key in `package.json` is not a second package manager. CI should call `npm ci`, not `pnpm install`.
- Scripts that call interactive tools? `dev` and `preview` are servers. `generate-routes` rewrites a generated file. Neither belongs in the first required job.
- Tests that need a browser or network? No test script and no test files, so nothing to run. Live Supabase and the embedding provider need network and secrets; they stay in Bucket B.
- No Node version pin (`engines`, `.nvmrc`, or `.node-version`). Runners need a current Node that can install this lockfile. The app was typechecked and built with Node v22 in this inspection. That version is an observation, not a repo pin.
- Several TanStack packages are ranged as `"latest"` in `package.json`. `npm ci` still installs the versions locked in `package-lock.json`. Do not switch installers.
- `src/lib/supabase.browser.ts` throws at module load when the two public `VITE_` names are missing. That did not fail `vite build`. A future SSR change could execute that module during build. If a clean runner then fails the build, fix the app so compile does not require secrets, or supply only the public names — never `SUPABASE_SERVICE_ROLE_KEY` — and record that choice before expanding Bucket A.
- Bucket A cannot catch behavior regressions until a `test` script exists. Reviewers still have to exercise auth, listings, and search when those paths change.

## Link back to earlier docs
- Pain/goals addressed by Bucket A (from [`docs/ci/pr-pain-and-goals.md`](pr-pain-and-goals.md)):
  - Forgotten local installs → `npm ci` on the pull request.
  - Skipped typecheck and build → required `npm run typecheck` and `npm run build`.
  - No shared cloud run → one GitHub-hosted recipe on open and on update.
  - Broken code reaching `main` with no shared bar → fail the PR check when install, typecheck, or build fails.
  - Reviewers re-running “does it build?” → the green check or red X is already on the request.
  - Lint and test stay out until scripts exist. The goals brief says to run them once scripts are confirmed. They are not confirmed.
  - Secrets and production access stay outside this sprint’s PR automation (Bucket B).
- CI idea used: automated checks on every PR before merge (from [`docs/ci/ci-concepts-notes.md`](ci-concepts-notes.md)). The machine runs the Bucket A recipe. A person still approves and merges. A green check means those commands passed on that commit. It does not mean “merge it.”

## Source files inspected
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tsconfig.typecheck.json`
- `app.config.ts`
- `README.md`
- `.env.example`
- `.gitignore` (`.env`, `.env.*`, `dist`, `.output`)
- `src/lib/supabase.browser.ts`
- `src/lib/supabase.server.ts`
- `src/server/sponsor-session.server.ts`
- `src/lib/embeddings/generate.ts`
- `scripts/seed-property-embeddings.ts`
- `supabase/migrations/` (`20250315000000_enable_pgvector_properties.sql`, `20250315000001_match_properties_function.sql`, `20250321000000_property_listings.sql`, `20250321000000_sponsors_properties_rls.sql`)
- `src/routes/` (file-based routes; no test files)
- `docs/ci/pr-pain-and-goals.md`
- `docs/ci/ci-concepts-notes.md`
