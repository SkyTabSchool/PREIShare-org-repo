<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `npx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

# PREIshare — AGENTS

Human-and-agent onboarding memory for this repo. Durable rules live in [`.cursor/rules/preishare.mdc`](.cursor/rules/preishare.mdc). Keep the Intent skill-loading block above; do not remove it.

## What this is

PREIshare is a **real-estate intelligence** product: help investors decide more intelligently.

- Single package at repo root (`preishare-org-repo`); app code under `src/`
- Stack: TypeScript, React, TanStack Start (file-based Router), Vite, Tailwind CSS v4, npm
- Intended data layer (not in tree yet): Supabase, PostgreSQL, pgvector

## Onboarding docs

| Doc | Use it for |
|-----|------------|
| [`docs/onboarding/team-orientation-notes.md`](docs/onboarding/team-orientation-notes.md) | Mission, GitHub workflow, PR definition of done, AI-use stance |
| [`docs/onboarding/repo-map.md`](docs/onboarding/repo-map.md) | Paths, safe first-touch vs do-not-edit-yet |
| [`docs/onboarding/setup-log.md`](docs/onboarding/setup-log.md) | Clone/remotes setup audit trail |

If a path claim conflicts with the disk, trust the disk and update the repo map.

## Scripts (from package.json / repo-map)

No `test`, `lint`, or `format` scripts were present when mapped. Use only what exists:

```bash
npm run dev              # Vite on port 3000
npm run build
npm run preview
npm run generate-routes
```

Confirm scripts in `package.json` or `docs/onboarding/repo-map.md` before inventing others.

## Layout (quick)

- `src/routes/` — pages (`__root.tsx`, `index.tsx`, `about.tsx`)
- `src/components/` — shared UI
- `src/styles.css` — Tailwind / tokens
- `src/router.tsx` — router factory
- `src/routeTree.gen.ts` — generated; do not hand-edit

## Agent behavior

1. **Plan** — Restate the goal; list files to touch; read onboarding docs / repo map when unsure.
2. **Small diff** — Smallest change that finishes the task; match neighboring style; no drive-by refactors or new libraries unless asked.
3. **Verify** — Stop after each logical unit; check the change does what was requested.

Also:

- Prefer existing patterns over greenfield frameworks.
- Point detailed conventions at [`.cursor/rules/preishare.mdc`](.cursor/rules/preishare.mdc) rather than duplicating them here.
- Never commit or print secrets; document env *names* only if config is needed.
- Safe first PRs: `docs/onboarding/` (and small mentored `README.md` clarifications). Avoid auth, billing, migrations, CI secrets, lockfile churn, and tooling edits unless explicitly tasked.
