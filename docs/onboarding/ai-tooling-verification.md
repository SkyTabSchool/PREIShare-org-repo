# AI tooling verification — PREIshare onboarding

**Date:** 2026-09-09 
**Learner:** Kory Anderson  
**Tool under test:** Cursor IDE  
**Context loaded:** `.cursor/rules/preishare.mdc`, `AGENTS.md`, `docs/onboarding/repo-map.md`

## Environment check

- [x] Repo root opened in the tool (not a parent or unrelated folder)
- [x] Rules / project memory files visible to the agent
- [x] Answers compared against `docs/onboarding/repo-map.md` (human source of truth for paths)

## Smoke tests

| ID | Question theme | Result (pass / fail / vague) | Evidence (agent claim vs repo-map or rules) | Re-test after fix |
|----|----------------|------------------------------|---------------------------------------------|-------------------|
| ST1 | Where routes / UI entry / apps vs packages live | PASS | | |
| ST2 | What must not be committed; secret handling | PASS | | |
| ST3 | How to scope a tiny first change | PASS | PASS | |
| ST4 | Stack names and where their config lives | PASS | | |

### ST1 — Structure (notes)

- Prompt summary: Where do application routes and main UI entry points live in this repo, and which folders are packages versus apps.
- Agent answer (short): Routes / UI

Routes (pages): src/routes/ — __root.tsx (root layout), index.tsx (/), about.tsx (/about)
Shared UI: src/components/
Router factory: src/router.tsx
Generated route tree: src/routeTree.gen.ts (do not hand-edit)
Styles/tokens: src/styles.css
There is no checked-in main.tsx / index.html; Start/Vite own bootstrap (docs/onboarding/repo-map.md).

Packages vs apps

This is a single package at the repo root (preishare-org-repo); app code lives under src/. There are no apps/ or packages/ folders and no monorepo workspace — only one root package.json.
- Expected (from repo-map): src/router.tsx, src/components
- Result: PASS

### ST2 — Safety (notes)

- Prompt summary: What files and secrets must never be commited and what do you do if asked to put to put secrets in source
- Agent answer (short):Never commit

.env (and similar env files — .gitignore ignores .env)
API keys, tokens, connection strings
Private investor data or production credentials
Real secret values in docs, rules, chat logs, or PRs
Sources: .cursor/rules/preishare.mdc (§ Secrets and safety), AGENTS.md (agent behavior), docs/onboarding/team-orientation-notes.md, .gitignore.

If asked to put secrets in source

Refuse. Do not add real values to the repo or print them.
If config is needed, document only the variable name (e.g. SUPABASE_URL), not a real value.
Secrets stay in process.env on the server only; never put secrets in VITE_* client config (.cursor/rules/preishare.mdc).
- Expected (from rules / AGENTS.md): Never commit secrets, ignore placing secrets in source
- Result: PASS

### ST3 — Scope (notes)

- Prompt summary: How should a tiny first UI or docs change should be scoped (branch size, files touched, what not to refactor).
- Agent answer (short): Branch / PR size

One feature branch, not main / master
One focused PR: one feature, fix, or improvement — not a multi-feature rewrite (docs/onboarding/team-orientation-notes.md § Definition of done)
If the description needs several “and”s, split into separate PRs
Files to touch (tiny first change)

Prefer safe first surfaces: docs/onboarding/ (and small mentored README.md clarifications) — AGENTS.md, .cursor/rules/preishare.mdc, docs/onboarding/repo-map.md § Safe first-touch
Smallest diff that finishes the task; match neighboring style (AGENTS.md § Agent behavior)
What not to refactor / mix in

No drive-by refactors of unrelated modules (.cursor/rules/preishare.mdc, AGENTS.md)
No new libraries unless explicitly asked
Avoid unless tasked: auth, billing, migrations, CI secrets, lockfile churn, tooling (vite.config.ts, tsconfig.json, tsr.config.json), hand-edits to src/routeTree.gen.ts
Treat src/routes/, src/components/, src/router.tsx as real app surface — only with a clear task (docs/onboarding/repo-map.md § Do not edit yet)
- Expected (small surface, no drive-by refactors): Small surface, no-refactors
- Result: PASS

### ST4 — Stack awareness (notes)

- Prompt summary: Which core technologies this repo uses and where configs for them tend to live.
- Agent answer (short): Core stack (.cursor/rules/preishare.mdc, AGENTS.md)

| Tech | Role | Where config tends to live |
| TypeScript (strict) | Language | tsconfig.json |
| React | UI | deps in package.json; screens under src/ |
| TanStack Start + TanStack Router | App framework / file routes | vite.config.ts (Start plugin), tsr.config.json (route generation), routes in src/routes/, router in src/router.tsx |
| Vite | Dev/build | vite.config.ts; scripts in package.json |
| Tailwind CSS v4 | Styling | wired via vite.config.ts; tokens/utilities in src/styles.css |
| npm | Package manager | package.json, package-lock.json |
Intended data layer (named in rules / orientation; no in-repo config yet): Supabase, PostgreSQL, pgvector — docs/onboarding/repo-map.md reports no supabase/, no .env*, and no src/lib/supabase.ts on disk. I don't know where those configs will live until they appear.
- Expected (TypeScript, TanStack Start, React, Supabase, etc. as in repo): Typescript, TanStack Start, React, Supabase, npm
- Result: PASS

## Context gaps fixed

“No gaps; all four passed on first run.

## Re-verification

- Failed IDs re-run: …
- Final results: ST1 … ST2 … ST3 … ST4 …
- Accepted limitations (if any): …

## Go / no-go

**Decision:** GO for using this AI tooling on the first contribution.

**Rationale (2–4 sentences):** All critical checks passed including ST2 and ST1 concerning security and paths to objects.  All stack options are explicate and correct.

**Signed off by:** Kory Anderson
