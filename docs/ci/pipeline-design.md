# PREIshare PR CI — Pipeline Design

## Purpose
Plain-language design for automated checks on every pull request for the PREIshare dashboard.
This document is the source of truth for the GitHub Actions workflow in `.github/workflows/pr-ci.yml`.
It does **not** deploy anything and does **not** replace human review.

Commands below come from [`docs/ci/project-ci-inventory.md`](project-ci-inventory.md) and the scripts in `package.json`.
The workflow file is [`.github/workflows/pr-ci.yml`](../../.github/workflows/pr-ci.yml).

## Trigger
- Event: `pull_request`
- Branches: PRs targeting the main integration branch (`main`)
- Goal: every proposed change gets the same checkout → setup Node → install → typecheck → build → lint → test loop before merge discussion continues

## Ordered stages (happy path)
1. **Checkout** — fetch the PR commit so the runner has the proposed code
2. **Setup Node** — install a Node.js version that can run this lockfile. There is no `.nvmrc`, no `.node-version`, and no `engines` field. Inventory observation only: typecheck and build succeeded on Node v22. Treat v22 as a temporary runner choice until the repo pins a version. Do not write that pin into `package.json` from this design.
3. **Install dependencies** — clean install from the lockfile: `npm ci` against `package-lock.json` (lockfileVersion 3, package `preishare-investor-dashboard`). Package manager is npm. Do not call `pnpm install` or `yarn`. The `pnpm` key in `package.json` is not a second package manager, and there is no `pnpm-lock.yaml`.
4. **Typecheck** — `npm run typecheck`, which runs `tsc --noEmit -p tsconfig.typecheck.json`. This checks TypeScript without emitting a production bundle. It does not need Supabase env.
5. **Build** — `npm run build`, which runs `vite build --config app.config.ts`. This is the production app build so broken imports and config fail on the PR. Inventory verified exit 0 with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `EMBEDDING_API_KEY` blank. The production build does not call Supabase.
6. **Lint** — `npm run lint`, which runs `eslint .` using `eslint.config.js`. This runs after the build.
7. **Test** — `npm run test`, which runs `vitest run`. Vitest uses `vitest.config.ts` in the Node environment. It is not a browser end-to-end suite. This runs after lint.

**Required order:** checkout → setup Node → `npm ci` → `npm run typecheck` → `npm run build` → `npm run lint` → `npm run test`. Stop on the first failure.

Leave these scripts off the required job:

- `dev` (`vite dev --port 3000 --config app.config.ts`) and `preview` (`vite preview --config app.config.ts`) start long-running servers.
- `generate-routes` (`tsr generate`) rewrites `src/routeTree.gen.ts`. It is not a pass/fail gate.

## Commands / scripts (from inventory)
| Stage       | Script or command | Required on PR? |
|-------------|-----------------------------------------------|-----------------|
| Checkout    | `actions/checkout` | Yes |
| Setup Node  | Node 22 (`actions/setup-node`, npm cache keyed on `package-lock.json`) | Yes |
| Install     | `npm ci` (lockfile `package-lock.json`; README local command is `npm install`, which is not the CI install) | Yes |
| Typecheck   | `npm run typecheck` → `tsc --noEmit -p tsconfig.typecheck.json` | Yes |
| Build       | `npm run build` → `vite build --config app.config.ts` | Yes |
| Lint        | `npm run lint` → `eslint .` | Yes |
| Test        | `npm run test` → `vitest run` | Yes |

## Failure policy
- Any required stage failing (`npm ci`, `npm run typecheck`, `npm run build`, `npm run lint`, or `npm run test`) → the CI job fails (red X on the PR)
- Do not add `continue-on-error: true` for those gates
- Humans still decide merge; CI only reports whether install, typecheck, build, lint, and test passed on that commit

## Caching intent
- Cache npm dependency downloads, keyed on `package-lock.json`, so repeated PRs install faster
- Do not cache `node_modules` in a way that ignores lockfile changes
- Do not cache build output (`dist`, `.output`, or other Vite/Nitro emit dirs) across PRs. A green build must come from the commit under review
- Exact cache actions land in the workflow YAML later; this section only records the intent

## Environment and secrets
- Typecheck and build run with committed config. Inventory completed both with the Supabase and embedding env names blank. The first workflow should not set those variables
- No production secrets in PR CI logs. Never pass `SUPABASE_SERVICE_ROLE_KEY` into this job. Never put that key in a `VITE_` name
- Public env names the app reads (values stay out of the repo and out of this job): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `EMBEDDING_API_KEY`. Optional names in server code: `EMBEDDING_MODEL`, `EMBEDDING_API_URL`. `NODE_ENV` is used for the session cookie `secure` flag
- No dummy Supabase URL or key is required for the current typecheck and build
- Do not connect PR CI to production Supabase projects. Do not apply `supabase/migrations/*.sql`. Do not run `scripts/seed-property-embeddings.ts`
- Caveat from the inventory: `src/lib/supabase.browser.ts` throws at module load when `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing. That did not fail `vite build`. If a later SSR change executes that module during build, fix the app so compile does not require secrets, or supply only those two public names. Do not add the service-role key to unblock a build. Record that choice before expanding this pipeline

## Explicitly out of scope for this PR pipeline
- Production or staging **deploy**
- Live **Supabase** schema migrations or data mutations against shared/prod projects
- Sign-in, listings, property create, search, or embedding calls that need a live Supabase project or `EMBEDDING_API_KEY`
- `npm run dev`, `npm run preview`, and `npm run generate-routes`
- Manual QA, product acceptance, and final merge approval (human review)
- AI auto-merge or unattended approval of PRs
- A browser end-to-end suite. Lint is ESLint. Test is Vitest in Node.

## Mapping back to PREIshare goals
Pain addressed, from [`docs/ci/pr-pain-and-goals.md`](pr-pain-and-goals.md):

- Forgotten local installs → required `npm ci` on the pull request
- Skipped typecheck, build, lint, and test → required `npm run typecheck`, `npm run build`, `npm run lint`, and `npm run test`, in that order after install
- No shared cloud run → one GitHub-hosted job on `pull_request` (open and update) targeting `main`
- Broken code reaching `main` with no shared bar → the job fails when install, typecheck, build, lint, or test fails
- Reviewers re-running “does it build?” → the green check or red X is already on the request

Inventory rows that drive each required stage:

| Required stage | Inventory source |
|----------------|------------------|
| `npm ci` | Bucket A item 1; lockfile facts (`package-lock.json` only); “Scripts discovered” note that there is no `install` script |
| `npm run typecheck` | Bucket A item 2; scripts table row `typecheck` |
| `npm run build` | Bucket A item 3; scripts table row `build`; env caveat that build finished with Supabase names blank |
| `npm run lint` | Bucket A item 4; scripts table row `lint` |
| `npm run test` | Bucket A item 5; scripts table row `test` |

Human boundary: CI is a consistent signal that those commands passed in order. Reviewers still own approval, product and UX judgment, security-sensitive design (service-role key, RLS, secrets out of `VITE_` names), and data handling. Later AI review prompts support that judgment. They do not replace it. A green check is not permission to merge.

## Open questions / gaps
- [x] Any CI-ready script missing from package.json? **No.** `lint` is `eslint .`. `test` is `vitest run`. Both run after build, in that order.
- [x] Node version source of truth unclear? **Yes.** No `engines`, `.nvmrc`, or `.node-version`. Node v22 is an inspection observation, not a repo pin. The workflow may use Node 22 so the job matches the machine that already typechecked and built this lockfile. Pinning that version in the repo is a separate change.
- [x] Tests that need a database: skipped, mocked, or blocked until a safe test setup exists? **The PR test step does not use a database.** `npm run test` runs Vitest in Node. Live Supabase, embeddings, seed (`scripts/seed-property-embeddings.ts`), and `supabase/migrations/` stay in inventory Bucket B. They need secrets and a non-production database. They are not part of this PR job. Reviewers still exercise auth, listings, and search when those paths change.

## Sign-off for next step
`.github/workflows/pr-ci.yml` runs these stages in order: checkout, Node setup, `npm ci`, `npm run typecheck`, `npm run build`, `npm run lint`, `npm run test`, plus the npm cache on setup Node. No deploy, no Supabase, and no extra scripts.
