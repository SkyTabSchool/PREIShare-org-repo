# Branch protection checklist (PREIshare PR CI)

## Purpose
Connect the automated green/red signal from `.github/workflows/pr-ci.yml` to merge policy on protected branches. This document is for maintainers with admin access. Contributors without admin rights prepare and verify the checklist only.

## Protected branches
- [ ] Protect `main` (add other merge-target branches only if listed in `docs/ci/pipeline-design.md`)

`docs/ci/pipeline-design.md` lists one merge target: `main`. No other branch belongs in this rule until that design doc names it.

## Required status checks
After the workflow has run at least once on a PR, GitHub will show the check name.
- [ ] Require status checks to pass before merging
- [ ] Required check name must match the job that runs quality gates: `Install Dependancies` (job `name` in `.github/workflows/pr-ci.yml`; the job id `ci` and the workflow name `PR CI` are not the check name). Confirm it matches the exact name shown on a real PR check run, including spelling.
- [ ] Prefer “Require branches to be up to date before merging” so the last CI run reflects the merge base

Enable “Require branches to be up to date before merging” once `Install Dependancies` has reported on a pull request into `main`. A green run should mean the gates passed against current `main`, not against the `main` that existed when the pull request opened. Updating the branch starts a new run. The workflow cancels the older in-progress run for that same pull request.

## What CI already enforces (automated)
- Dependency install (`npm ci`)
- Typecheck (`npm run typecheck`)
- Production build (`npm run build`)
- Lint (`npm run lint`)
- Tests (`npm run test`)

## What humans still own (not optional)
- [ ] At least one human review/approval before merge
- [ ] AI-assisted review prompts (later step) are helpers only — never auto-merge on AI output alone
- [ ] Secret/config and product intent review outside pure CI green

AI review prompts never replace human approval. A person still approves or requests changes, and a person still owns the merge. A green `Install Dependancies` check is not permission to merge.

## What not to require yet
- [ ] Do not require optional or flaky jobs that are not in `pr-ci.yml`
- [ ] Do not require deploy/production jobs on pull requests
- [ ] Do not store secrets in the PR CI workflow just to satisfy a check

## Readiness sign-off
- [ ] Workflow file path: `.github/workflows/pr-ci.yml`
- [ ] Triggers: `pull_request` (`opened`, `synchronize`, `reopened`) to the protected branch list above (`main`)
- [ ] Concurrency: cancel in-progress runs for the same PR when new commits land (`group` includes `github.event.pull_request.number`, `cancel-in-progress: true`)
- [ ] Maintainer who can edit branch protection: __________________
- [ ] Date verified against a real PR check run: __________________

## Notes for Sprint 6 handoff
A red required check should block merge. A green check means automated quality gates passed — not that product review is done.
