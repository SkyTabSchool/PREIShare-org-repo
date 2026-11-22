# PREIshare CI concepts notes

**Audience:** beginner builders directing an AI coding agent  
**Sprint deliverable:** continuous integration and AI-assisted quality (humans still own merge)  
**Stack:** TypeScript, TanStack Start, React, Supabase  
**Companion brief:** [`docs/ci/pr-pain-and-goals.md`](pr-pain-and-goals.md)  
**How to use this file:** read these four answers before writing or reviewing a CI workflow. They explain the idea. They do not replace human approval on a pull request.

## 1. What is continuous integration?

Continuous integration (CI) means the team automatically checks proposed work every time it is offered for review, using one shared recipe.

On PREIshare, proposed work arrives as a GitHub pull request. CI is the practice of running the same quality steps on that request as soon as it opens, and again each time the author updates it. Those steps are the ones named in the Sprint 6 goals: install dependencies, typecheck TypeScript, build the TanStack Start / React dashboard, lint, and test.

The point is timing and sameness. The checks happen while the change is still a proposal, on a clean environment GitHub provides, with the same commands every time. A teammate does not have to remember to run them on a personal laptop. Reviewers can trust that “the checks ran” means the same thing on every request.

CI is a signal for the team. It is extra evidence next to human review. A passing run does not approve the pull request, and it does not decide the merge. An author still owns the change. A reviewer still judges design, risk, and data handling. A person still merges.

## 2. What is a pipeline or workflow in plain language?

A pipeline (GitHub calls the file a **workflow**) is the written list of steps the shared check follows, in order, from a clean start to a pass or a fail.

Think of it as a checklist a machine can follow without asking anyone what to do next:

1. Checkout — get the proposed code from the pull request onto a fresh runner.
2. Setup — install Node.js 22.
3. Install — install the project’s dependencies from the lockfile.
4. Typecheck — run TypeScript typecheck.
5. Build — build the dashboard.
6. Lint — run ESLint.
7. Test — run Vitest in Node.
8. Report one clear result back on the pull request: passed, or failed at a named step.

“Pipeline” and “workflow” name that same ordered run. The workflow is the recipe stored with the project. The pipeline is that recipe actually running when a pull request opens or updates. Each step depends on the one before it: there is no point building if install failed, and a later green step does not erase an earlier failure.

The recipe should stay small and stable. It repeats the checks the team already expects. It does not deploy the live product, merge the pull request, or replace a reviewer’s judgment.

## 3. What does a green check vs a red X mean on a pull request?

GitHub shows the workflow result on the pull request so anyone can see it without rerunning the steps.

**Green check.** Every required step in the workflow finished successfully on this version of the change. Install, typecheck, build, lint, and test (whichever of those the workflow requires) all passed in the shared environment. Reviewers can spend their time on design, product risk, security-sensitive logic, and data handling. They still decide whether the change is ready. Green means “the machine checks passed on this snapshot.” It does not mean “merge it,” and it does not mean the investor experience is correct.

**Red X.** At least one required step failed on this version of the change. The pull request is showing a problem the whole team can see: dependencies did not install, TypeScript rejected the code, the dashboard did not build, lint failed, or a test failed. The author looks at the failed step, fixes the change, and updates the pull request. The workflow runs again on the new snapshot. A red X is a reason to pause the merge conversation until that snapshot is green, because the team agreed these checks are the shared bar for “does this still build and pass?”

A missing or spinning indicator means the run has not finished yet, or the workflow did not start. Wait for a green check or a red X before treating the machine result as known. Either symbol is about the latest commit on the pull request. An older green check does not cover a newer push.

## 4. Why should PREIshare run the same checks on every pull request?

PREIshare should run one shared workflow on every pull request, at open and on every update, because that is how the team proves a change still installs, typechecks, builds, lints, and tests before anyone folds it into `main`.

**The same checks, every time.** Personal machines differ. One laptop may already have dependencies installed, a newer Node version, or a local file that hides a break. Another may skip lint or tests under time pressure. A clean run on GitHub uses the recipe in the repo, so “passed” means the same steps, in the same order, for every author. Reviewers stop redoing “does it build?” and use their attention on judgment the machine cannot make.

**On the pull request, before merge.** The check belongs on the proposal, while the work is still on a feature branch. If the workflow ran only after merge, a broken change would already be on `main`, which is the shared line that moves toward the product investors use. Fixing it then means a follow-up change on the shared branch, and everyone else builds on top of the break in the meantime. Running on the pull request lets the author repair the red X before a maintainer merges.

**Visible to the whole team.** The green check or red X sits on the request itself. Nobody has to ask a teammate to “try it locally” to learn whether install, typecheck, or build failed. That matches the team rule that a pull request should be reviewable without a side meeting, and that “it works on my machine” is not the standard.

The workflow still leaves the merge with a person. Green is required evidence that the shared checks passed. Approval remains a human decision about whether this focused change is safe to fold into the product.

## 5. Pain points mapped to CI ideas

Each row takes one current pain from [`pr-pain-and-goals.md`](pr-pain-and-goals.md) and names the CI idea that answers it. The idea is what the shared workflow should do. It stays inside Sprint 6: machines run the checks, and a person still approves and merges.

| Pain today | CI idea |
| --- | --- |
| Teammates must remember to install dependencies on their own machines. | Automated install on the pull request. The workflow installs dependencies in a clean environment every time the request opens or updates, so a forgotten local install is no longer the only chance to catch a break. |
| Build, typecheck, lint, and test are easy to skip under time pressure. | Those steps are required stages in the one workflow. Skipping them locally does not skip them on the pull request. A missing or failed stage shows up as a red X. |
| There is no consistent cloud run tied to opening or updating a pull request. “It works on my machine” can hide a different Node setup, leftover files, or a step someone never ran. | One shared runner environment. GitHub starts from a fresh machine and runs the same recipe on every open and every update, so “passed” means the same steps for every author. |
| Broken code can reach `main` because nothing blocks on shared checks. | The check runs on the pull request, before merge. A failed install, typecheck, build, lint, or test fails the PR check in the open, while the work is still on a feature branch. |
| Reviewers spend energy re-running basic “does it build?” work instead of judging design and risk. Review of that basic bar is slow. | A fast automated signal before humans deep-dive. The green check or red X is already on the request, so reviewers start with design, product risk, security-sensitive logic, and data handling. |
| There is no shared written line between machine checks and human judgment, including AI-assisted review help. | Write that line down and keep it. The workflow owns install, typecheck, build, lint, and test. Humans own approval, risk, data handling, and the merge. AI review prompts can speed the reading. A person remains accountable for the decision. |

## 6. Non-examples / CI washing

CI washing is calling a habit “continuous integration” when the shared checks never run the same way on every pull request. The activity can look like quality work and still leave PREIshare with the pains in the Sprint 6 brief. Each case below fails the definition in section 1: one shared recipe, on the pull request, every time it opens or updates, before anyone merges.

**Only running `npm run build` on a laptop.** An author builds the TanStack Start dashboard on their own machine, sees it succeed, and treats that local success as the pull request check. It fails the definition because the build never runs automatically, for every author, in one shared environment when the pull request opens or updates.

**Merging because an AI said “looks fine” while checks never ran.** A reviewer accepts an assistant’s summary of a PREIshare pull request and a maintainer merges it to `main` with no install, typecheck, build, lint, or test run attached to that request. It fails the definition because a written opinion, including an AI opinion, is not the shared machine recipe, and the checks that would have produced a green check or a red X never ran.

**A workflow file that exists but is never triggered on pull requests.** The repo contains a workflow that lists install, typecheck, and build, and that file only runs when someone starts it by hand or after the change is already on `main`. It fails the definition because a recipe that does not start on pull request open and update never checks the proposal the team is about to merge.
