# PREIshare repository map

> Onboarding map for first contribution planning. Built with AI-assisted
> inventory + human path verification. Do not treat this as architecture law
> if the real tree disagrees—update this file when you learn more.

## Meta

- Clone path (from setup-log): `/home/kory/vscode/school/INFO\ 3330/PREIshare-org-repo`
- Date mapped: `2026-09-09`
- Agent tool used: `coding-agent`
- Mapper: `Kory Anderson` / `SkyTabSchool` (from `docs/onboarding/setup-log.md`)

Setup-log anchors used for Meta and remotes:

- Team repo (upstream): `https://github.com/EdTechForLearning/PREIshare-org-repo`
- Fork (origin): `https://github.com/SkyTabSchool/PREIshare-org-repo`
- Orientation notes: `docs/onboarding/team-orientation-notes.md`
- Default branch after clone: `main`

Tree paths below were confirmed by listing the local clone on the mapping date (not printed as a full tree in the setup-log). If a path claim conflicts with `ls` on disk, trust the disk and update this file.

## 1. Overview (5–8 sentences)

PREIshare appears to be organized as: **single package** (one root `package.json`; no `apps/`, `packages/`, or workspace config found).
In plain language, the product code seems to live mainly in `src/` (routes, components, styles, router).
Shared libraries or packages appear in **none found** (no monorepo packages; only a small `src/lib/` stub).
Docs and onboarding notes live in `docs/` (including this file).
I am intentionally not editing application code while building this map.
The stack clues in root manifests point at TanStack Start + React + Vite + TypeScript + Tailwind, matching the blank scaffold described in `AGENTS.md`.
Supabase, PostgreSQL, and pgvector are named in orientation notes as the intended data layer, but no matching config folders or env examples were present in the clone at mapping time.

## 2. Top-level inventory

| Path | Kind (app / package / config / docs / other) | One-sentence purpose | Verified by me? (yes/no) |
|------|-----------------------------------------------|----------------------|---------------------------|
| `AGENTS.md` | docs / agent config | Project and agent guidance for stack, layout, and Intent skill loading | yes |
| `.cta.json` | config | Create TanStack App scaffold metadata | yes |
| `.cursorrules` | config | Cursor agent rules for editing this app | yes |
| `docs/` | docs | Onboarding and project documentation | yes |
| `.git/` | other | Local Git metadata for this clone | yes |
| `.gitignore` | config | Ignores `node_modules`, `.env`, build outputs, and similar | yes |
| `package.json` | config | Root package manifest and npm scripts | yes |
| `package-lock.json` | config | npm lockfile for reproducible installs | yes |
| `README.md` | docs | Scaffold getting-started and build notes | yes |
| `src/` | app | Application source (routes, UI, styles, router) | yes |
| `tsconfig.json` | config | TypeScript compiler options | yes |
| `tsr.config.json` | config | TanStack Router file-route generation config | yes |
| `vite.config.ts` | config | Vite plugins for Start, React, Tailwind, and Devtools | yes |
| `.vscode/` | config | Editor settings for this workspace | yes |

No top-level `apps/`, `packages/`, `.github/`, `supabase/`, or `.env*` files were present when this map was written.

## 3. Frontend concerns (TypeScript, React, TanStack Start)

- Likely app root(s): repo root package `preishare-org-repo`, with UI under `src/`
- Clues I used (file names, frameworks mentioned in `package.json`): `@tanstack/react-start`, `@tanstack/react-router`, `react`, `react-dom`, `vite`, `tailwindcss`; routes under `src/routes/`; `vite.config.ts` enables `tanstackStart()`
- Entry / routes / UI areas worth knowing:
  - `src/router.tsx` — router factory
  - `src/routeTree.gen.ts` — generated route tree (do not hand-edit)
  - `src/routes/__root.tsx` — root layout / document shell
  - `src/routes/index.tsx` — `/` home route
  - `src/routes/about.tsx` — `/about` route
  - `src/components/` — `Header.tsx`, `Footer.tsx`, `ThemeToggle.tsx`
  - `src/styles.css` — Tailwind / global styles
  - `src/lib/user.ts` — small typed user stub (not a separate app)
- How this area relates to user-facing screens: file routes under `src/routes/` define the pages users hit; shared chrome lives in `src/components/`; Start/Vite own the runtime bootstrap (no checked-in `main.tsx` / `index.html` found)

## 4. Backend / data concerns (Supabase, PostgreSQL, pgvector, APIs)

- Supabase or data config paths: **not found yet** (no `supabase/` folder; no `src/lib/supabase.ts` despite `.cursorrules` naming that file)
- Migrations / SQL / schema-related paths: **not found yet**
- Env examples (NOT secret values): **not found yet** (no `.env.example`; `.env` is gitignored and was absent locally)
- Notes on what a beginner should not touch in production data: do not invent DB credentials, do not add real secrets to the repo, and do not change hosted Supabase/Postgres data until the team has a real data-layer task, review, and safe local setup. Orientation notes (`docs/onboarding/team-orientation-notes.md`) describe Supabase/PostgreSQL/pgvector as intended product data tools—planning context only until code appears.

## 5. Tooling and CI

- TypeScript / lint / format config: `tsconfig.json` present; **no** ESLint / Prettier / Biome / EditorConfig files found; no `lint` / `format` scripts in `package.json`
- CI workflows (e.g. GitHub Actions): **not found** (no `.github/` in the clone)
- Editor or agent config already present: `.vscode/settings.json`, `.cursorrules`, `AGENTS.md`, `.cta.json`
- Related build tooling (also treat as tooling): `vite.config.ts`, `tsr.config.json`
- Scripts from package manifests that look like dev/build/test: `dev`, `build`, `preview`, `generate-routes` (no `test` script found)

## 6. Safe first-touch vs do-not-edit-yet

### Safe first-touch (good candidates for a tiny onboarding PR)

| Path or area | Why it is relatively safe | Risk if handled carelessly |
|--------------|---------------------------|----------------------------|
| `docs/onboarding/` | Docs-only; helps the team; setup-log already lives here | Misleading docs |
| `docs/onboarding/repo-map.md` (this file) | Onboarding artifact; expected to be corrected over time | Stale path claims confuse new contributors |
| `docs/onboarding/setup-log.md` | Personal setup audit trail (already created) | Wrong remotes/paths if edited carelessly |
| `README.md` (small clarifying edits only, if mentored) | Human-facing; low runtime impact | Conflicting setup advice vs orientation notes |

### Do not edit yet (wait until you have tests, review, and a real task)

| Path or area | Why wait | What could break |
|--------------|----------|------------------|
| CI under `.github/` or equivalent | Shared pipeline (when added) | Everyone’s builds |
| Root workspace / package manager lockfiles (`package-lock.json`, `package.json` dependency churn) | Dependency graph | Install failures for all |
| Supabase / migrations / production env | Data and secrets (when introduced) | Data loss or leaked secrets |
| Shared packages used by multiple apps | Wide blast radius (N/A today; still wait if added) | Multiple features regress |
| Auth, payments, or vector/search core (if present) | High complexity; not in tree yet | Security or relevance bugs |
| `src/routeTree.gen.ts` | Generated by the router CLI | Hand edits get overwritten / drift from routes |
| `vite.config.ts`, `tsconfig.json`, `tsr.config.json`, `.cursorrules`, `AGENTS.md`, `.cta.json`, `.vscode/` | Tooling / do-not-edit-yet | Broken local/CI tooling or agent guidance |
| `src/routes/`, `src/components/`, `src/router.tsx` | Real app surface; needs a clear task | Broken pages or layout for users |

## 7. Open questions for the team

- Where will Supabase client config, migrations, and `.env.example` live when the data layer lands (and should `.cursorrules`’s `lib/supabase.ts` path be `src/lib/supabase.ts`)?
- What is the official runtime entry module for TanStack Start in this repo if no `main.tsx` / `index.html` is checked in?
- Will CI (GitHub Actions) and lint/format configs be added soon, and who owns those files?
- Is product work expected only in this single package, or will an `apps/` / `packages/` monorepo layout appear later?
- Which remote should everyday PRs target first—`origin` (personal fork) then upstream, per setup-log—and is that still the team convention?

## 8. How I will use this map next

- Configure AI project rules/memory using the paths above (next tooling steps).
- Pick a first contribution only from **Safe first-touch** unless a mentor expands scope.
- Revisit and edit this file when a path claim is proven wrong.
