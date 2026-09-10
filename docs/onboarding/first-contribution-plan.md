# First contribution plan — PREIshare onboarding

## Author
- Name / GitHub handle: Kory Anderson / SkyTabSchool
- Feature branch: docs/first-contribution-SkyTabSchool
- Date: 2026-09-09

## One-sentence goal
Add myself as a new contributor in a contributors doc and make one minimal, reviewable docs (or agreed low-risk UI) touch so the team can practice review on a small first PR.

## Why this surface (link to prior artifacts)
- From `docs/onboarding/repo-map.md`: Safe first-touch lists `docs/onboarding/` as “Docs-only; helps the team; setup-log already lives here,” and notes that first contributions should stay in that table unless a mentor expands scope. This plan stays in onboarding docs plus a root `CONTRIBUTORS.md` entry (docs-only, no app runtime).
- From `docs/onboarding/team-orientation-notes.md`: Matches first-PR definition of done—one focused job on a feature branch (not `main`), self-contained enough for a teammate to review without a meeting, and small enough that “and” does not pile on unrelated work.
- From `docs/onboarding/ai-tooling-verification.md`: Decision is **GO** for using this AI tooling on the first contribution; ST1–ST4 passed (structure, secrets, tiny-change scope, stack awareness), so agent rules are verified enough to assist implementation next.

## In scope (only these)
1. Create or update `CONTRIBUTORS.md` with my name, GitHub handle, and a one-line role (e.g. "Onboarding engineer").
2. Optional second touch (pick at most one, or none):
   - None for this PR — keep the diff to `CONTRIBUTORS.md` only so review stays under 10 minutes. (Repo-map marks `src/routes/` and `src/components/` as do-not-edit-yet without a clear mentored task; skip UI.)
3. Capture implementation notes later in `docs/onboarding/first-contribution-notes.md` (next step—not done here).

## Out of scope (explicitly not this PR)
- Auth, sessions, or environment secrets
- Database schema, migrations, Supabase policies, or pgvector changes
- Dependency upgrades or lockfile churn unrelated to the contribution
- Multi-package refactors, renames, or formatting the whole repo
- CI/CD workflow edits unless a mentor explicitly assigns them

## Likely files to change
| File | Action | Why |
|------|--------|-----|
| CONTRIBUTORS.md | create or update | Add my contributor entry |
| n/a | n/a | No optional second touch |
| docs/onboarding/first-contribution-notes.md | create (next step) | Record what the agent did and what I verified |

## Acceptance criteria
- [ ] I am on feature branch `docs/first-contribution-SkyTabSchool` (not the default branch).
- [ ] `CONTRIBUTORS.md` lists my name and GitHub handle in a consistent format.
- [ ] Any second touch is limited to the single file named above and does not change behavior beyond copy/docs.
- [ ] No secrets, `.env` files, or generated build artifacts are included.
- [ ] A teammate can review the diff in under 10 minutes without product-context deep dives.

## Verification plan (how I will know it worked)
1. `git status` / `git branch` show I am on the feature branch with only expected files modified.
2. Open `CONTRIBUTORS.md` and confirm my row/section renders as plain Markdown.
3. If a UI touch was included: run the app’s normal dev command from the setup log and visually confirm the copy change; otherwise skip.
4. Skim `git diff` and confirm nothing outside the likely-files table appears.

## Risks and mitigations
- Risk: Agent expands scope into app core. Mitigation: refuse diffs that touch files not listed above; re-prompt with the out-of-scope list.
- Risk: Editing default branch by mistake. Mitigation: check `git branch` before every edit session.

## Definition of done for this planning step
- [x] Feature branch created from updated default branch.
- [x] This plan file saved at `docs/onboarding/first-contribution-plan.md` with all sections filled (no angle-bracket placeholders left).
- [x] Ready to implement in the next step without re-deciding scope.
