# Review response notes — first PREIshare PR

## PR under review
- Branch name: docs/first-contribution-SkyTabSchool
- PR title (after any edits): Created CONTRIBUTORS.md and added SkyTabSchool.
- Link or local identifier: https://github.com/EdTechForLearning/PREIShare-org-repo/pull/13
- Related files: CONTRIBUTORS.md, docs/onboarding/pr-description.md, docs/onboarding/first-contribution-notes.md

## Simulated reviewer setup
- Tool used (chat-assistant / coding-agent): Cursor IDE agent
- What context I pasted for the reviewer: The pr-description.md file
- Date of simulation: 2026-09-09

## Feedback received

### Comment 1
- **Theme:** Scope mismatch vs claimed “~2 files”
- **Blocking?** yes
- **Reviewer said:** The PR text says reviewers should expect roughly CONTRIBUTORS.md + first-contribution-notes.md, and that you skipped a second touch. Against current main, docs/first-contribution-SkyTabSchool also carries earlier commits that introduce/duplicate other onboarding docs (team-orientation-notes.md, repo-map.md, setup-log.md, ai-tooling-verification.md, first-contribution-plan.md) — about 7 files / 600+ lines, because the branch diverged before those landed on main.
- **My decision:** accept-now
- **Why:** The commit history included multiple files irrelevant to the PR.
- **Action taken:** Rebased to main with the irrelevant files on main rather than the feature branch.
- **Evidence:** N/A

### Comment 2
- **Theme:** PR text vs actual change
- **Blocking?** yes
- **Reviewer said:** Summary/Approach read like a clean “add one table row” PR, but they undersell the real history and over-promise focus. Also: you created CONTRIBUTORS.md with a single row; you did not “add yourself to an existing list.” The Notes section still hedges (“plus this description draft if included”) while that draft is not part of the branch deliverable.
- **My decision:** accpet-now
- **Why:** The title and summary of the PR were lacking clarity.
- **Action taken:** Changed the summary of the PR description and the title provided to the reviewer
- **Evidence:** PR title

### Comment 3
- **Theme:**  Verification evidence is author-claimed, not PR-proven
- **Blocking?** yes
- **Reviewer said:** first-contribution-notes.md marks checks done, but the PR Test plan is still all unchecked, and there’s no paste of the rendered table, no git diff --stat against the intended base, and no note that you confirmed the branch tip is based on current main. For a self-contained first PR, reviewers shouldn’t have to trust a separate notes file.
- **My decision:** accept-now
- **Why:** The PR plan still showed that the checks were unchecked which does not show that it was reviewed by myself
- **Action taken:** Added evidence of checks passing
- **Evidence:** Table from contributors.md in PR description

### Comment 4
- **Theme:**  Commit / message hygiene
- **Blocking?** no
- **Reviewer said:** History is noisy for a one-row docs PR:

Commit	Issue
e19996e / 17cfe35
Same subject twice: “Created a feature branch and a first contribution plan”
376d4e8
Vague: “Implemented first contribution plan”
9c7186d
Clear — keep this style
Four commits also mix planning, bulk onboarding docs, and the contributors row.
- **My decision:** accept-now
- **Why:** The commit history did not explain what was happening and contained irrelevant data
- **Action taken:** Removed irrelevant commits from feature branch
- **Evidence:** Commit history contains 1 commit

### Comment 5
- **Theme:**  Small consistency polish
- **Blocking?** no
- **Reviewer said:** Role casing drifts (Onboarding engineer in the plan vs Onboarding Engineer in the PR/notes/table). Harmless, but pick one before merge so the table becomes the template for the next person.
- **My decision:** decline
- **Why:** The only difference between the two is whether engineer is capitalized, I deemed it irrelevent.
- **Action taken:** N/A
- **Evidence:** N/A

## Follow-up commits (if any)
| Commit message | Files touched | Addresses which comment # |
| --- | --- | --- |
| | | |

There are no follow up commits since all changes were removing commits and updating information in the PR itself.

## PR description edits (if any)
- Sections changed (summary / test plan / risk / other): Summary
- Before → after (short paraphrase is fine): Changed scope from adding an entry to CONTRIBUTORS.md to creating CONTRIBUTORS.md with an entry for myself
- Why the edit helps a reviewer: Clarifies what the PR is about

## Re-verification checklist
- [x] Still on the same feature branch (not main)
- [x] Latest commits pushed; PR shows updated head
- [x] Diff includes only intended onboarding files
- [x] No secrets, .env values, or machine-specific paths added
- [x] Manual or scripted checks claimed in the PR still pass
- [x] Blocking comments all have a written resolution
- [x] Non-blocking items either fixed or parked with a reason

## Merge-readiness statement
In 3–5 sentences: is this PR ready to merge from a beginner-onboarding perspective? What would you still want a human mentor to double-check?

The PR appears ready to merge from a beginner-onboarding perspective.  I would still want a human mentor to double check that only the required files are being pushed in the commit.  I would also want a human mentor to comment and make sure that I did all steps for a PR correctly.

## What I learned about review culture
- One habit I will keep: Keep consise on the PR description
- One mistake I will avoid next time: Multiple messy commits that cloud what is actually intended in the PR