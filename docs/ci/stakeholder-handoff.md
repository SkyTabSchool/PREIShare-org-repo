# PREIshare Sprint 6 — Stakeholder Handoff

**Audience:** PREIshare product owners, tech leads, and reviewers
**Sprint goal:** Continuous integration on every pull request, plus AI-assisted review that leaves the merge decision with a person
**Date:** 2026-11-21
**Author:** SkyTab4096

This note explains what the sprint automated, what people still own, and what is still unfinished. It repeats decisions already written in the files listed in section 7. It does not add workflow steps or secret names beyond those files.

---

## 1. Client story recap (why we did this)

PREIshare is shipping an investor dashboard. Proposed changes arrive as GitHub pull requests. Before this work, each teammate had to remember to install dependencies, typecheck, build, lint, and test on a personal machine. Those steps were easy to skip. A broken change could land on the main branch, and reviewers spent time re-running “does it build?” instead of judging design, risk, and data handling.

**What changed:** Opening or updating a pull request into `main` is set up to run the same check every time, on a clean GitHub-hosted machine. The check installs from the lockfile, then typechecks, builds, lints, and tests. A person still approves the pull request and owns the merge, even when the check is green.

**Source notes:** `docs/ci/pr-pain-and-goals.md`, `docs/ci/pipeline-design.md`

---

## 2. What is automated on every pull request

The live file is `.github/workflows/pr-ci.yml`. The design it follows is `docs/ci/pipeline-design.md`. The commands are listed in `docs/ci/ci-scripts-notes.md`.

| Stage | What runs | Where defined |
| --- | --- | --- |
| Trigger | A pull request that targets `main`, when it is opened, updated with new commits, or reopened | `.github/workflows/pr-ci.yml` |
| One run at a time | A newer push on the same pull request cancels the older in-progress run | same file (`concurrency`) |
| Setup | Check out the pull request, install Node.js 22, install dependencies with `npm ci` from `package-lock.json`. Node setup caches npm downloads using that lockfile | same file |
| Quality gates | Typecheck, then production build, then lint, then test. The job stops on the first failure | same file + `docs/ci/ci-scripts-notes.md` |
| Failure behavior | A failed step fails the job, so the pull request shows a red check. That red check does not block merge until a repo admin turns on branch protection | `docs/ci/branch-protection-checklist.md`, `docs/ci/e2e-verification-log.md` |

The GitHub check name is the job’s display name: `Install Dependancies`. That spelling is the one in the workflow file. The job id `ci` and the workflow title `PR CI` are different strings. Admins must copy `Install Dependancies` exactly when they require the check.

Commands, in order:

1. `npm ci`
2. `npm run typecheck` (`tsc --noEmit -p tsconfig.typecheck.json`)
3. `npm run build` (`vite build --config app.config.ts`)
4. `npm run lint` (`eslint .`)
5. `npm run test` (`vitest run`, so the job exits instead of watching)

Node 22 is a temporary choice in the workflow. The repo has no `.nvmrc`, no `.node-version`, and no `engines` field. Pinning Node in the repo is a separate change. This handoff does not add that pin.

**Plain-language summary for stakeholders:**
If install, types, the production build, lint, or tests break, the pull request shows a failed check. Teammates fix the pull request and push again. They do not skip the check. A green check means those five commands passed on that commit. It is not permission to merge.

**Left out of this workflow on purpose:**

- Production or staging deploy
- Live Supabase, schema migrations, and the embedding seed script
- Sign-in, listings, property create, search, or embedding calls that need a live project
- The dev server, the preview server, and route generation (`dev`, `preview`, `generate-routes`)
- A browser end-to-end suite. Lint is ESLint. Test is Vitest in Node
- Product, UX, security, and data-handling judgment
- Reading the diff, and the approve or merge click
- Secret values. The workflow has no secrets block and no environment block. It does not print credentials. It does not pass `SUPABASE_SERVICE_ROLE_KEY`

---

## 3. What humans still decide

| Decision | Owner | Why it stays human |
| --- | --- | --- |
| Approve, request changes, or merge | Reviewer / maintainer | A green check means install, typecheck, build, lint, and test passed. It does not mean the feature is right |
| Product, UX, security-sensitive logic, and data handling | Reviewer | Those judgments are outside the five commands |
| Whether to use the AI review prompts, and what to do with the answer | Reviewer | The prompts speed reading. They can miss context. They are not a vote |
| Where credentials live | Maintainer | Secret values stay out of the workflow file, the pull request text, and the assistant |
| Turning on branch protection | Repo admin | Protection is a GitHub setting. The workflow file does not turn it on |
| When a later change may pass only the two public Supabase names into a build | Tech lead | Record that choice before expanding the pipeline. Do not add the service-role key to unblock a build |

**AI-assisted review boundary:**
The prompt pack in `docs/ci/ai-pr-review-prompts.md` has three helpers: a plain-language diff summary, risk flags (auth, Supabase, migrations, secrets, destructive data changes), and a short list of questions for the human reviewer. The assistant must not approve, reject, or merge, and must not claim the check is green unless a person pastes the result. A named teammate still writes the GitHub review and still clicks merge. Do not paste production secrets, `.env` values, or live credentials into the assistant.

On 2026-11-21 the risk-flag prompt was tried on the workflow file itself, using a chat assistant. The assistant did not approve or merge. The human call was to ask for more information: one real GitHub Actions run, plus a maintainer to set branch protection. The prompt text was not edited in this pass.

---

## 4. How to enable branch protection (operator checklist)

Admins with permission to change repository settings should follow `docs/ci/branch-protection-checklist.md`. Do this only after one pull request into `main` has shown the check name `Install Dependancies`. The verification log says GitHub has not reported that name yet.

When that run exists, require at least:

1. Protect `main`. The pipeline names no other merge-target branch.
2. Require status checks to pass before merging, using the check name `Install Dependancies` (the spelling on the workflow job).
3. Prefer “Require branches to be up to date before merging,” so the last run matches current `main`. Updating the branch starts a new run and cancels the older one for that pull request.
4. Require at least one human review before merge.

Also leave these off the required list: jobs that are not in `pr-ci.yml`, deploy jobs, and any secret stored in the workflow just to make a check pass.

**Status after verification:** [x] Not enabled yet  /  [ ] Enabled on main
**Evidence:** `docs/ci/e2e-verification-log.md` (2026-11-21). Every box on the branch-protection checklist is still open. The maintainer line and the “date verified against a real PR check run” line are blank. A protection lookup without credentials returned HTTP 401, so enforcement on `main` was not confirmed.

---

## 5. Known limits and risks (honest scope)

These are limits the design chose or the 2026-11-21 verification actually saw.

| Limit | Impact | Recommended next action |
| --- | --- | --- |
| GitHub Actions has not run this workflow. On 2026-11-21 the repo had 0 workflow runs and 0 pull requests | The check name and the “cancel the older run” behavior are written in the file. Nobody has seen them on GitHub | Open one pull request into `main`, read the Actions log, and confirm the check is named `Install Dependancies` before requiring it |
| Branch protection on `main` is not confirmed | A red check is visible once a run exists, and it does not yet stop a merge | A repo admin completes section 4 after that first run |
| The check name is the misspelling `Install Dependancies` | A corrected spelling in branch protection will not match the job | Copy the name from `.github/workflows/pr-ci.yml`. Rename the job only in a later change that updates the checklist too |
| Node.js 22 is set only in the workflow | Laptops and GitHub can drift if someone uses another Node version. Local verification used Node v22.23.1 and npm 10.9.8 | Keep the workflow on 22 until the team pins a version in the repo as its own change |
| Tests do not use a database or a browser | The local run passed 1 file and 3 tests. Sign-in, listings, search, embeddings, migrations, and the seed script are not part of this job | Reviewers still exercise those paths when a pull request changes them. Leave live Supabase and `scripts/seed-property-embeddings.ts` out of this workflow |
| Typecheck and build passed with Supabase and embedding settings blank | The current production build does not call Supabase. `src/lib/supabase.browser.ts` throws if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing when that module loads. That did not fail `vite build` | If a later server-render change fails the build for that reason, fix the app so compile does not need secrets, or supply only those two public names. Do not add `SUPABASE_SERVICE_ROLE_KEY` |
| `npm ci` reported 14 dependency advisories (2 moderate, 4 high, 8 critical) and still exited 0 | Advisories do not turn this check red | Treat them as a separate review item. Do not weaken the install, typecheck, build, lint, or test steps to chase them |
| The AI trial read the workflow file, not a hosted log | A later reader could treat “the file looks clean” as proof that GitHub logs are clean. The prompt does not force that distinction | Wait for one real Actions log. A prompt edit can wait for a real pull-request trial. This pass did not change the prompt |

No flaky test appeared in the dry run. The first local sequence passed, and no file was changed to force a red check.

---

## 6. Verification snapshot

From `docs/ci/e2e-verification-log.md`, verified by SkyTab4096 on 2026-11-21. Repository `SkyTabSchool/PREIShare-org-repo`, `main` at `94cea80`. There was no `feature/ci-dry-run` branch.

- **Pull request opened / workflow triggered on GitHub:** no. The workflow file is on `main` and is active, and the public Actions API showed 0 runs and 0 pull requests. Workflow page: `https://github.com/SkyTabSchool/PREIShare-org-repo/actions/workflows/pr-ci.yml`. There is no run id.
- **The same commands passed locally, in order:** yes. `npm ci`, `npm run typecheck`, `npm run build`, `npm run lint`, and `npm run test` each exited 0. Environment: Node v22.23.1, npm 10.9.8, Linux. `npm ci` added 324 packages.
- **Static review of the workflow file:** yes. Trigger, step order, script names, npm cache, fail-on-error, and the absence of secrets all matched the design.
- **Intentional failure experiment:** no. Nothing was broken on purpose. The log records no red check.
- **AI review prompt trial:** yes. Prompt 2 (risk flags) on the workflow file. The assistant did not approve or merge. The human asked for more information and did not treat the trial as a merge decision.
- **Blockers found:** GitHub has never reported the check name `Install Dependancies`. Cancel-in-progress has not been seen live. Branch protection is not verified (checklist blank, protection API returned 401). A green local dry run is not a GitHub required check.

**Overall gate status in the log:** credible with known gaps. Safe for this Sprint 6 handoff, with the caveats in section 5.

---

## 7. Artifact index (where everything lives)

| Artifact | Purpose |
| --- | --- |
| `docs/ci/pr-pain-and-goals.md` | Why pull requests were painful, and what this sprint should automate |
| `docs/ci/pipeline-design.md` | The planned stages, the failure rule, and what stays out of the job |
| `.github/workflows/pr-ci.yml` | The workflow GitHub will run on pull requests into `main` |
| `docs/ci/ci-scripts-notes.md` | The npm commands the workflow calls, and how to rerun them locally |
| `docs/ci/branch-protection-checklist.md` | Admin steps to require the check and a human review |
| `docs/ci/ai-pr-review-prompts.md` | Three review prompts. Advice only. A person still merges |
| `docs/ci/e2e-verification-log.md` | Static review, local command results, and the gaps still open |
| `docs/ci/stakeholder-handoff.md` | This handoff |

Related background, not a new pipeline: `docs/ci/project-ci-inventory.md` and `docs/ci/ci-concepts-notes.md`.

---

## 8. What should roll into the next Sprint 6 topic

Trust first. Do not add steps, secrets, or a second package manager in order to look finished.

1. Open one pull request into `main`. Confirm GitHub shows the check name `Install Dependancies`, including that spelling, and that a newer push cancels the older run. Then turn on branch protection: protect `main`, require that check, prefer “up to date before merging,” and require one human review. Confirm a red check blocks merge.
2. Keep this job free of production secrets, live Supabase, migrations, and `scripts/seed-property-embeddings.ts`. If a future build starts executing the browser Supabase client, record the choice in `docs/ci/pipeline-design.md` before changing the workflow. The allowed unblock is an app fix, or only the two public names `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The service-role key stays out.
3. Decide later, outside this required job, what to do about the 14 dependency advisories. They did not fail `npm ci`.
4. After one or two real pull-request reviews, adjust the risk prompt so the assistant says whether it read the files or a GitHub log. Keep the rule that the assistant does not approve or merge.
5. Leave a repo-wide Node version pin, browser end-to-end tests, and deploy for a later decision. The local test run found no flake to quarantine.

---

## 9. One-paragraph executive summary

PREIshare pull requests into `main` are set up to run one public check: install from the lockfile, then typecheck, build, lint, and test, on Node.js 22. If any of those steps fails, the pull request shows a red check named `Install Dependancies`. On 2026-11-21 those same commands passed on a developer machine, and GitHub itself had not run the workflow yet, so branch protection is still off and a red check does not block merge. AI prompts can speed reading a diff, and a person still approves and merges. Admins should require that exact check name only after one real Actions run reports it. The next topic should close that gap, and should leave secrets, live Supabase, and deploy out of this job.
