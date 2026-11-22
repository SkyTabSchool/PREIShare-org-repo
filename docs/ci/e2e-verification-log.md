# PREIshare PR CI — End-to-End Verification Log

**Date:** 2026-11-21
**Verifier:** SkyTab4096
**Repo / branch used:** `SkyTabSchool/PREIShare-org-repo`, `main` working tree at `94cea80` (tracks `origin/main`). No `feature/ci-dry-run` branch.
**Inputs checked:**
- `.github/workflows/pr-ci.yml`
- `docs/ci/ci-scripts-notes.md`
- `docs/ci/branch-protection-checklist.md`
- `docs/ci/ai-pr-review-prompts.md`

---

## 1. Static workflow review

| Check | Result (pass/fail) | Evidence / notes |
| --- | --- | --- |
| Triggers on `pull_request` (branches as designed) | pass | `on.pull_request.types` is `opened`, `synchronize`, `reopened`. `branches` is only `main`, which is the single merge target in `docs/ci/pipeline-design.md` and `docs/ci/branch-protection-checklist.md`. |
| Job name(s) clear for GitHub status checks | pass | One job. Id is `ci`. Display name is `Install Dependancies`. The checklist says that display name is the required-check string; `ci` and workflow name `PR CI` are not. Spelling is the documented typo, so maintainers must copy it exactly. |
| Step order: checkout → runtime setup → install → typecheck → build → lint → test | pass | Steps in `.github/workflows/pr-ci.yml`: Checkout (`actions/checkout@v4`), Set up Node.js (`actions/setup-node@v4`, `node-version: "22"`), Install dependencies, Typecheck, Build, Lint, Test. |
| Each `run:` matches scripts in `docs/ci/ci-scripts-notes.md` | pass | `npm ci`, `npm run typecheck`, `npm run build`, `npm run lint`, `npm run test`. Those match the notes table and the `package.json` scripts (`tsc --noEmit`, `vite build`, `eslint .`, `vitest run`). |
| Caching / dependency install strategy present and sensible | pass | Install is `npm ci` against `package-lock.json`. `setup-node` sets `cache: npm`, which keys the download cache on the lockfile. The job does not cache `node_modules` or `.output`. |
| Fail-fast behavior acceptable (failed step fails the job) | pass | No `continue-on-error`. A failing step fails the job. That matches the failure policy in `docs/ci/pipeline-design.md`. |
| No plaintext secrets or unsafe `${{ }}` expansions in logs | pass | No `secrets` context, no `env` block, and no `echo` of credentials. The only `${{ }}` uses are the concurrency group (`github.workflow` and `github.event.pull_request.number`). Service-role and embedding keys are not passed in. |

**Static review summary:** The workflow file matches the designed PR loop: one job on pull requests into `main`, lockfile install, then typecheck, build, lint, and test. The status-check name to require later is `Install Dependancies`. The file does not print secrets, does not deploy, and does not call Supabase. This review is of the YAML on `main`. GitHub Actions has not executed it yet (see section 3).

---

## 2. Local CI command dry-run

Run the same sequence CI will run. Copy commands from `docs/ci/ci-scripts-notes.md`.

| Step | Exact command | Exit (pass/fail) | Notes |
| --- | --- | --- | --- |
| Install | `npm ci` | pass | Exit 0. Added 324 packages from the lockfile. npm also reported 14 audit vulnerabilities (2 moderate, 4 high, 8 critical). Audit output did not fail the command. |
| Typecheck | `npm run typecheck` | pass | Exit 0. `tsc --noEmit -p tsconfig.typecheck.json` printed no errors. |
| Build | `npm run build` | pass | Exit 0. Vite client, SSR, and Nitro production builds completed (`vite build --config app.config.ts`). |
| Lint | `npm run lint` | pass | Exit 0. `eslint .` finished with no findings. |
| Test | `npm run test` | pass | Exit 0. `vitest run`: 1 file, 3 tests, all passed. |

**Environment notes:** Node v22.23.1, npm 10.9.8, Linux 7.1.9-200.fc44.x86_64. Package manager is npm. Working directory was the repo root. Commands ran one after another on 2026-11-21.

**Local dry-run summary:** The full sequence succeeded. Nothing broke. The first hosted Actions run is still outstanding; this dry-run only shows the same commands pass on this machine.

---

## 3. PR → CI loop checklist

Use `docs/ci/branch-protection-checklist.md` as the source of checklist items.

| Checklist item | Status (Ready / Needs work / Blocked) | Evidence |
| --- | --- | --- |
| Workflow runs on pull requests | Ready | Trigger block in `.github/workflows/pr-ci.yml` (section 1). Public Actions API on 2026-11-21: workflow `pr-ci.yml` is active, `total_count` of runs is 0, and the repo has 0 pull requests. Dry-run rationale: the YAML is on `main` and the local command sequence passed; there is no Actions run URL yet. Workflow page: `https://github.com/SkyTabSchool/PREIShare-org-repo/actions/workflows/pr-ci.yml` |
| Check names suitable as required status checks | Needs work | Exact check name to require: `Install Dependancies` (job `name`). Job id `ci` and workflow name `PR CI` are not that name. GitHub has never reported the check (0 runs, 0 PRs). Checklist sign-off “Date verified against a real PR check run” is blank, so the string shown in the GitHub UI is not confirmed. |
| Concurrency / duplicate-run behavior acceptable | Ready | `group: ${{ github.workflow }}-pr-${{ github.event.pull_request.number }}` and `cancel-in-progress: true`. A newer push on the same PR cancels the older run. Not observed live, because there are no runs. |
| Human still required for merge (CI ≠ auto-merge) | Needs work | Docs already say a human approves and merges: `docs/ci/branch-protection-checklist.md` (“What humans still own”) and `docs/ci/ai-pr-review-prompts.md` (“Human merge authority”). The workflow has no deploy or merge step. The checklist box “At least one human review/approval before merge” is still unchecked, and branch protection on `main` returned HTTP 401 without credentials, so enforcement is not verified. |
| Branch protection readiness gaps listed | Needs work | Open items quoted from `docs/ci/branch-protection-checklist.md`: protect `main`; require status checks before merging; require the check name `Install Dependancies` after a real PR run; prefer “Require branches to be up to date before merging”; human review before merge; AI output is never auto-merge; do not require jobs that are not in `pr-ci.yml`; do not require deploy jobs; do not store secrets in the workflow to satisfy a check. Maintainer line and “date verified against a real PR check run” are blank. |

**PR loop summary:** A teammate can open a PR into `main` tomorrow and the workflow definition should run install, typecheck, build, lint, and test. That signal is not trustworthy as a required gate until one Actions run reports `Install Dependancies` and a maintainer turns on branch protection. A green local dry-run is not that GitHub check.

---

## 4. AI-assisted review dry-run (human remains accountable)

**Sample change used:** `.github/workflows/pr-ci.yml` as it stands on `main` (commits `d8b1cb9` through `5752f13`): pull_request trigger for `main`, concurrency that cancels in-progress runs for the same PR number, Node 22, `npm ci`, then typecheck, build, lint, and test. No app, auth, or SQL files in that sample.
**Prompt chosen:** Prompt 2 — Risk flags (auth, Supabase, migrations) from `docs/ci/ai-pr-review-prompts.md`
**Tool category used:** chat-assistant

**AI output — what helped:**
- Stayed inside the secrets bucket. Observed in the workflow: no `secrets` context, no `env` block, and no `SUPABASE_SERVICE_ROLE_KEY` or `EMBEDDING_API_KEY` passed into the job.
- Skipped auth, Supabase row access, migrations, and destructive data changes because those files are not in this diff.
- Asked a concrete reviewer question: has anyone read a hosted Actions log, or only the YAML? The public API showed 0 runs, so “logs are clean” is an inference from the file plus the local dry-run, not an observed GitHub log.
- Did not say approve, LGTM, or merge, and did not claim the workflow is safe.

**AI output — problems (if any):**
- Prompt 2 does not require the assistant to label “YAML only” versus “Actions log observed.” A later reviewer could treat a static reading as proof that GitHub logs are clean.
- No invented bugs and no false “approved” on this run.

**Human judgment call:** Ask for more info. The workflow text and the local command sequence are enough to keep the job, and they are not enough to mark the required check confirmed. The missing info is one pull-request Actions run whose check name is exactly `Install Dependancies`, plus a maintainer to set branch protection. CI green would still not be permission to merge.

**Prompt fix applied?** No — the prompt already forbids approve/merge and “claim the code is safe.” The labeling gap is a residual risk in section 5, not a prompt edit in this pass.

---

## 5. Assess → fix → re-verify cycles

| Cycle | What failed | Fix applied (file + change) | Re-verify result |
| --- | --- | --- | --- |
| 1 | No failures; full sequence passed on first dry-run | No file change | `npm ci`, `npm run typecheck`, `npm run build`, `npm run lint`, and `npm run test` each exited 0, in that order |

Residual risk: GitHub has 0 runs of `pr-ci.yml`, so cancel-in-progress behavior and the displayed check name are unobserved. `npm ci` printed 14 dependency advisories and still exited 0, so audit findings do not fail this gate.

---

## 6. Gate credibility decision

**Overall gate status:** Credible with known gaps

**Known gaps still open:**
1. No pull-request Actions run, so the required check name `Install Dependancies` is not confirmed in the GitHub UI, and concurrency cancel has not been seen live.
2. Branch protection on `main` is not verified (checklist boxes unchecked; protection API returned 401). Human review before merge is policy in the docs, not an enforced rule yet.
3. Node 22 is a workflow pin only. The repo has no `engines`, `.nvmrc`, or `.node-version`. Browser end-to-end tests are intentionally out of this job.

**Safe for Sprint 6 stakeholder handoff?** Yes with caveats

**Notes for Step 12 handoff:**
- Local CI sequence on 2026-11-21 passed on Node v22.23.1 and npm 10.9.8: `npm ci`, typecheck, build, lint, test.
- The workflow on `main` is `.github/workflows/pr-ci.yml`. It runs on pull requests into `main` only. The status-check name to require later is `Install Dependancies`, including that spelling.
- Do not turn on required status checks until one PR run has reported that exact name. Then enable “Require branches to be up to date before merging.”
- Concurrency is one run per PR number, and a newer push cancels the in-progress run. That behavior is specified, not yet observed on GitHub.
- Humans still approve and merge. The AI prompt pack is advice only. This job does not deploy, does not take Supabase secrets, and does not include a browser end-to-end suite.
