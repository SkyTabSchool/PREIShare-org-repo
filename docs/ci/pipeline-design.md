# PREIshare PR CI — Pipeline Design

## Purpose
Plain-language design for automated checks on every pull request for the PREIshare dashboard.
This document is the source of truth for the GitHub Actions workflow we will write next.
It does **not** deploy anything and does **not** replace human review.

Commands below come only from [`docs/ci/project-ci-inventory.md`](project-ci-inventory.md).
That inventory inspected `package.json`, `package-lock.json`, and the TypeScript configs.
A missing script is a **gap**. This design does not invent `lint` or `test` commands.

## Trigger
- Event: `pull_request`
- Branches: PRs targeting the main integration branch (`main`)
- Goal: every proposed change gets the same install → typecheck → build loop before merge discussion continues

Lint and test are not in that loop yet. The inventory found no `lint` script and no `test` script, so the workflow must not call `npm run lint` or `npm run test`.

## Ordered stages (happy path)
1. **Checkout** — fetch the PR commit so the runner has the proposed code
2. **Setup Node** — install a Node.js version that can run this lockfile. There is no `.nvmrc`, no `.node-version`, and no `engines` field. Inventory observation only: typecheck and build succeeded on Node v22. Treat v22 as a temporary runner choice until the repo pins a version. Do not write that pin into `package.json` from this design.
3. **Install dependencies** — clean install from the lockfile: `npm ci` against `package-lock.json` (lockfileVersion 3, package `preishare-investor-dashboard`). Package manager is npm. Do not call `pnpm install` or `yarn`. The `pnpm` key in `package.json` is not a second package manager, and there is no `pnpm-lock.yaml`.
4. **Lint** — **skipped (gap).** No `lint` script, no ESLint (or other linter) config, and no linter dependency. An `eslint-disable` comment in `src/routeTree.gen.ts` is not a lint setup.
5. **Typecheck** — `npm run typecheck`, which runs `tsc --noEmit -p tsconfig.typecheck.json`. This checks TypeScript without emitting a production bundle. It does not need Supabase env.
6. **Test** — **skipped (gap).** No `test` script, no Vitest/Jest/Playwright config, and no `*.test.ts` / `*.spec.ts` files. Nothing in the inventory is CI-ready as a test.
7. **Build** — `npm run build`, which runs `vite build --config app.config.ts`. This is the production app build so broken imports and config fail on the PR. Inventory verified exit 0 with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `EMBEDDING_API_KEY` blank. The production build does not call Supabase.

**Required order:** checkout → setup Node → `npm ci` → `npm run typecheck` → `npm run build`. Stop on the first failure.

**Why lint and test are omitted from the required job:** the scaffold’s typical rule is cheaper checks before slower ones, and install before anything that needs `node_modules`. That still holds for the scripts that exist. Lint would sit before typecheck, and test before build, once those scripts exist in `package.json`. Calling them now would fail the job because the script names are missing, not because the change is bad. The inventory’s Bucket A order is the order this design uses.

Leave these scripts off the required job:

- `dev` (`vite dev --port 3000 --config app.config.ts`) and `preview` (`vite preview --config app.config.ts`) start long-running servers.
- `generate-routes` (`tsr generate`) rewrites `src/routeTree.gen.ts`. It is not a pass/fail gate.

## Commands / scripts (from inventory)
| Stage       | Script or command (from project-ci-inventory) | Required on PR? |
|-------------|-----------------------------------------------|-----------------|
| Install     | `npm ci` (lockfile `package-lock.json`; README local command is `npm install`, which is not the CI install) | Yes |
| Lint        | **gap** — no `lint` script in `package.json` | No — do not call it |
| Typecheck   | `npm run typecheck` → `tsc --noEmit -p tsconfig.typecheck.json` | Yes |
| Test        | **gap** — no `test` script in `package.json` | No — do not call it |
| Build       | `npm run build` → `vite build --config app.config.ts` | Yes |

## Failure policy
- Any required stage failing (`npm ci`, `npm run typecheck`, or `npm run build`) → the CI job fails (red X on the PR)
- Do not add `continue-on-error: true` for those three gates
- Lint and test are gaps, not optional experiments. Do not add a step that is expected to fail, and do not label a missing script as an optional check
- Humans still decide merge; CI only reports whether install, typecheck, and build passed on that commit

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
- Adding ESLint, Vitest, or any other new tool so the gaps disappear. Choosing those tools is a team decision

## Mapping back to PREIshare goals
Pain addressed, from [`docs/ci/pr-pain-and-goals.md`](pr-pain-and-goals.md):

- Forgotten local installs → required `npm ci` on the pull request
- Skipped typecheck and build → required `npm run typecheck` and `npm run build`
- No shared cloud run → one GitHub-hosted job on `pull_request` (open and update) targeting `main`
- Broken code reaching `main` with no shared bar → the job fails when install, typecheck, or build fails
- Reviewers re-running “does it build?” → the green check or red X is already on the request

Lint and test stay out until scripts exist. The goals brief says to run them once scripts are confirmed. They are not confirmed.

Inventory rows that drive each required stage:

| Required stage | Inventory source |
|----------------|------------------|
| `npm ci` | Bucket A item 1; lockfile facts (`package-lock.json` only); “Scripts discovered” note that there is no `install` script |
| `npm run typecheck` | Bucket A item 2; scripts table row `typecheck` |
| `npm run build` | Bucket A item 3; scripts table row `build`; env caveat that build finished with Supabase names blank |
| Lint omitted | “Missing common checks” lint = **MISSING**; Bucket A “Leave these scripts off” |
| Test omitted | “Missing common checks” test = **MISSING**; “Test runner: none found”; Bucket C “Adding lint or tests later” |

Human boundary: CI is a consistent signal that those three commands passed. Reviewers still own approval, product and UX judgment, security-sensitive design (service-role key, RLS, secrets out of `VITE_` names), and data handling. Later AI review prompts support that judgment. They do not replace it. A green check is not permission to merge.

## Open questions / gaps
- [x] Any CI-ready script missing from package.json? **Yes.** Lint is missing. Test is missing. Do not add either command to the workflow until a real script exists.
- [x] Node version source of truth unclear? **Yes.** No `engines`, `.nvmrc`, or `.node-version`. Node v22 is an inspection observation, not a repo pin. The workflow may use Node 22 so the job matches the machine that already typechecked and built this lockfile. Pinning that version in the repo is a separate change.
- [x] Tests that need a database: skipped, mocked, or blocked until a safe test setup exists? **Blocked, because there is no test script.** Live Supabase, embeddings, seed (`scripts/seed-property-embeddings.ts`), and `supabase/migrations/` stay in inventory Bucket B. They need secrets and a non-production database. They are not part of this PR job. Bucket A also cannot catch behavior regressions until a `test` script exists; reviewers still exercise auth, listings, and search when those paths change.

## Sign-off for next step
When this design is stable, Step 6 may scaffold `.github/workflows/pr-ci.yml` from these stages only: checkout, Node setup, `npm ci`, `npm run typecheck`, `npm run build`, plus the npm-cache intent above. No deploy, no Supabase, no lint, no test, and no extra scripts.
