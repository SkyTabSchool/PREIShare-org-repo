# PREIshare onboarding handoff

**Author:** Kory Anderson / SkyTabSchool  
**Date:** 2026-09-09  
**Branch / PR:** `docs/first-contribution-SkyTabSchool` — https://github.com/EdTechForLearning/PREIShare-org-repo/pull/13  
**Audience:** mentor, future self, sprint lead

## 1. Stakeholder summary (plain language)

I completed PREIshare engineering onboarding for Sprint 1 (dev environment and AI tooling). I forked the team repository, cloned my fork, wired up origin and upstream, verified my local toolchain, configured Cursor-style project rules and agent memory, mapped the repo well enough to choose a safe first contribution, and opened (or prepared) a small pull request that follows the team’s Git and review habits. PREIshare remains a real-estate intelligence product; this work does not ship a product feature—it proves I can join the team workflow safely.

**Definition of done met:**
- [x] Fork created, local clone of my fork, both remotes and toolchain verified (see setup log)
- [x] AI rules / project memory in place and smoke-tested
- [x] First contribution implemented and committed on a feature branch
- [x] PR opened (or description ready) and review feedback addressed

## 2. Deliverables index (what exists and where)

| Artifact | Path | Why it matters |
| --- | --- | --- |
| Team orientation notes | docs/onboarding/team-orientation-notes.md | Mission, workflow, first-PR definition of done |
| Setup log | docs/onboarding/setup-log.md | Auditable proof of accounts, fork, Git identity, clone, remotes |
| Repo map | docs/onboarding/repo-map.md | Safe contribution surfaces (apps, packages, config) |
| AI tooling verification | docs/onboarding/ai-tooling-verification.md | Evidence agents respect PREIshare stack/conventions |
| Project rules | .cursor/rules/preishare.mdc | Persistent IDE-agent constraints |
| Agent memory entrypoint | AGENTS.md | Cross-tool project context for coding-agents |
| First contribution plan | docs/onboarding/first-contribution-plan.md | Scoped plan before code |
| Contribution notes | docs/onboarding/first-contribution-notes.md | What changed and why |
| Contributors credit | CONTRIBUTORS.md | Visible first contribution surface |
| PR description | docs/onboarding/pr-description.md | Reviewer-facing summary |
| Review response notes | docs/onboarding/review-response-notes.md | How feedback was handled |
| This handoff | docs/onboarding/onboarding-handoff.md | Single entry point for mentors |

## 3. Environment and toolchain snapshot

Copy only facts you verified in setup-log.md (do not invent versions):

- OS: Linux, Fedora 44
- Git user.name / user.email configured: yes (`SkyTabSchool` / `10977027@uvu.edu`; Git `2.55.0`)
- Node / package manager versions: TODO — not recorded in setup-log.md
- origin (my fork) URL: `https://github.com/SkyTabSchool/PREIShare-org-repo.git`
- upstream (team repo) URL: https://github.com/EdTechForLearning/PREIShare-org-repo
- Install/build/test commands run and result: TODO — setup-log.md does not record `npm install`, `npm run build`, `npm run test`, or similar results (repo-map notes scripts `dev` / `build` / `preview` / `generate-routes` exist; no `test` script found when mapped)
- Blockers hit and how resolved: none (setup-log §7 Issues and fixes: none)

## 4. AI tooling posture

- Rules file purpose (one sentence): from `.cursor/rules/preishare.mdc` — persistent always-on constraints so IDE agents keep PREIshare’s stack, safe first-touch surfaces, small-diff habits, and secret-handling rules without substituting other frameworks.
- AGENTS.md purpose (one sentence): human-and-agent onboarding memory entrypoint (Intent skill-loading plus project identity, onboarding doc index, scripts, layout, and agent behavior); durable conventions point at `.cursor/rules/preishare.mdc`.
- Smoke-test prompt used and whether the agent correctly named stack pieces (TypeScript, TanStack Start, React, Supabase, PostgreSQL, pgvector):
  - Tool under test: Cursor IDE; context loaded: `.cursor/rules/preishare.mdc`, `AGENTS.md`, `docs/onboarding/repo-map.md`.
  - ST1–ST4 all **PASS** on first run (structure, secrets, tiny-change scope, stack awareness).
  - ST4 prompt theme: which core technologies this repo uses and where configs tend to live. Agent named TypeScript (strict), React, TanStack Start + TanStack Router, Vite, Tailwind CSS v4, npm, and the intended data layer Supabase / PostgreSQL / pgvector (noting no in-repo data-layer config yet).
- Context gaps found and fixes applied (link to ai-tooling-verification.md): none — “No gaps; all four passed on first run.” Decision: **GO** for using this AI tooling on the first contribution. See `docs/onboarding/ai-tooling-verification.md`.

## 5. First contribution and review outcome

- Plan goal (from first-contribution-plan.md): Add myself as a new contributor in a contributors doc and make one minimal, reviewable docs (or agreed low-risk UI) touch so the team can practice review on a small first PR.
- Files touched (e.g. CONTRIBUTORS.md, notes): `CONTRIBUTORS.md` (created — single-row table); `docs/onboarding/first-contribution-notes.md` (created). Per notes: no optional second UI/docs touch.
- PR title and link: **Created CONTRIBUTORS.md and added SkyTabSchool.** — https://github.com/EdTechForLearning/PREIShare-org-repo/pull/13
- Review-style feedback received (summary): Simulated Cursor IDE agent review (2026-09-09) raised five themes — (1) scope mismatch / extra onboarding docs on the branch vs claimed ~2-file PR (blocking); (2) PR text undersold history / over-promised focus and misstated “add to existing list” vs create file (blocking); (3) verification evidence author-claimed, not PR-proven (blocking); (4) noisy commit / message hygiene (non-blocking); (5) role casing drift “Onboarding engineer” vs “Onboarding Engineer” (non-blocking).
- Changes made in response: Rebased to main and removed irrelevant commits so the feature branch carried only the intended change; updated PR title/summary to say creating `CONTRIBUTORS.md` with an entry; added check evidence (including rendered contributors table) in the PR description; declined Comment 5 (casing) as irrelevant. Review notes: no follow-up commits after cleanup — changes were history cleanup and PR text updates.
- Merge readiness: **ready with follow-ups** — review-response-notes state the PR appears ready to merge from a beginner-onboarding perspective, but a human mentor should still double-check that only the required files are in the commit and that PR steps were done correctly. Simulated review is complete; human mentor review/approval not documented as done.

## 6. Open risks and environment gaps

List anything a mentor should know before assigning feature work:

1. Supabase / PostgreSQL / pgvector are named as the intended data layer, but repo-map found no `supabase/` folder, no `src/lib/supabase.ts`, no `.env.example`, and no local `.env` at mapping time — env vars and data-layer setup are not fully configured locally.
2. Setup-log does not record Node/npm versions or successful `npm install` / `npm run build` / `npm run dev`; first-contribution notes skipped UI/dev-server verification (docs-only PR). No `test` / `lint` / `format` scripts were found when the repo was mapped; no CI (`.github/`) in the clone.
3. PR #13 had simulated review feedback addressed; merge readiness still asks for a human mentor to double-check the diff and PR process before treating onboarding as fully closed.

If none, write "None known" and state what you would re-verify on day one of the next sprint.

## 7. Decisions log (for stakeholders)

| Decision | Choice | Rationale |
| --- | --- | --- |
| First contribution surface | `CONTRIBUTORS.md` (plus implementation notes under `docs/onboarding/`) | Low risk, visible, matches onboarding plan and repo-map safe first-touch; no app runtime |
| Branch naming | `docs/first-contribution-SkyTabSchool` | Matches plan / orientation habit: feature branch, not `main` |
| AI tool category used most | coding-agent (Cursor IDE) | Used for repo map, AI smoke tests, contribution implementation, and simulated PR review; fits plan/verify/small-diff workflow |

## 8. Next-sprint preview (what this unlocks)

The next sprint topic can assume:

1. **Trusted local environment** — clone + toolchain documented in setup-log.md; re-run only if OS or versions change. (Re-verify Node/npm and install/build on day one — those facts are still TODO in the setup log.)
2. **AI alignment** — .cursor/rules/preishare.mdc and AGENTS.md exist; extend rules when new packages appear, do not start from zero.
3. **Git habit** — feature branch → small commits → PR → respond to review is practiced once end-to-end.
4. **First PR path** — merge-ready or merged onboarding contribution; feature work should use the same PR quality bar.

**Explicitly out of scope until later:** large product features, production deployments, and database migrations you have not been trained on yet.

## 9. Ask for mentor

- Questions still open:
  - Where will Supabase client config, migrations, and `.env.example` live when the data layer lands (and should `.cursorrules`’s `lib/supabase.ts` path be `src/lib/supabase.ts`)? (from repo-map §7)
  - Will CI (GitHub Actions) and lint/format configs be added soon, and who owns those files? (from repo-map §7)
  - Which remote should everyday PRs target first—`origin` (personal fork) then upstream—and is that still the team convention? (from repo-map §7)
  - Human mentor confirmation that PR #13’s final diff matches the intended docs-only scope and that onboarding merge can proceed.
- Review of this handoff requested: yes
- Preferred follow-up time or channel: TODO — not specified in onboarding documents

---

*End of handoff. Keep this file updated if merge status or env gaps change before the next sprint starts.*
