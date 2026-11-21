# PREIshare PR pain points and Sprint 6 CI goals

**Audience:** beginner builders directing an AI coding agent  
**Sprint deliverable:** continuous integration and AI-assisted quality (humans still own merge)  
**Stack:** TypeScript, TanStack Start, React, Supabase  
**How to use this file:** name this brief in every CI prompt so the agent stays inside Sprint 6 scope.

## Client need (in my own words)

PREIshare’s dashboard team needs every pull request to get the same automatic build-and-check run so broken TypeScript/React changes are caught before merge. Humans still decide whether the change is good enough to merge; automation only proves the project still installs, typechecks, builds, lints, and tests.

## Current PR pain points

- Teammates must remember to install dependencies on their own machines.
- Build, typecheck, lint, and test are easy to skip under time pressure.
- There is no consistent cloud run tied to opening or updating a pull request.
- Broken code can reach the main branch because nothing blocks on shared checks.
- Reviewers spend energy re-running basic “does it build?” work instead of judging design and risk.
- There is no shared written line between machine checks and human judgment (including any AI-assisted review help).

## Automated CI goals (machines should do these on every PR)

- Install project dependencies in a clean environment.
- Run TypeScript typecheck.
- Build the TanStack Start / React dashboard.
- Run lint (once scripts are confirmed).
- Run tests (once scripts are confirmed).
- Fail the PR check clearly when any required step fails.

## Human review stays in charge

- Approve or request changes on the pull request.
- Judge product/UX risk, security-sensitive logic, and data handling.
- Decide whether to merge—even if CI is green.
- Use AI review prompts only as assistance; a human remains accountable for the merge decision.
- Manage secrets and production access outside the PR automation designed in this sprint.

## Out of scope for this sprint (do not solve in the goals brief)

- Full production deploy from the PR workflow.
- Replacing human reviewers with fully automated merge.
- Deep performance or load testing suites (unless already a standard script).
- Inventing new app features unrelated to CI quality.

## Success signals

- Opening or updating a PR triggers a single clear CI workflow.
- Required checks (install → typecheck → build → lint → test) run in a sensible order.
- Failures are visible on the PR without asking a teammate to “try it locally.”
- An AI-assisted review prompt pack exists that speeds humans up without skipping human judgment.
- Stakeholders can read a short handoff that explains what is automated vs human-owned.
