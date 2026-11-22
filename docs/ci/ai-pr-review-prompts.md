# AI-assisted PR review prompt pack (PREIshare)

## Purpose
Use these prompts with a chat-assistant or ide-copilot when reviewing a
pull request on the PREIshare dashboard. They speed up human review.
They do **not** replace CI, and they do **not** replace a human merge decision.

**CI already covers:** install, typecheck, build, lint, and test on each PR
(see `docs/ci/pipeline-design.md` and `.github/workflows/pr-ci.yml`).
**Humans still cover:** product intent, auth safety, Supabase data access,
migrations, secrets, and the final approve/merge call.

## How to use this pack
1. Open the PR diff on GitHub (or locally with `git diff main...HEAD`).
2. Paste one prompt below into your assistant.
3. Attach or paste the relevant diff hunks (and file paths) the prompt asks for.
4. Read the answer as **advice only**. You still leave the review and decide merge.
5. Never paste production secrets, `.env` values, or live credentials into the assistant.

## Boundaries (read before every review)
- The AI is a **review assistant**, not a reviewer of record.
- The AI must **not** say approve, LGTM, request changes as a gate, or merge.
- The AI must **not** claim CI is green unless the human pastes CI results.
- Only a **human** PREIshare teammate may approve and merge the pull request.

---

## Prompt 1 — Plain-language diff summary

**When to use:** First pass on a PR so you know what changed before deep review.

**Copy-paste prompt:**

```text
You are a review assistant for the PREIshare dashboard (TypeScript, TanStack Start,
React, Supabase). Summarize the pull request diff I paste below.

Output format:
1. One-sentence goal of the change (best guess from the diff).
2. Bullet list of files touched, grouped by area (UI, API/server, Supabase/data, config/CI).
3. Bullet list of behavior changes a reviewer should verify manually.
4. Open questions for the author (max 5).

Hard rules:
- Do not approve, reject, or recommend merge.
- Do not invent files or behavior that are not in the diff.
- If the diff is incomplete, say what else you need.
- Label every claim as observed in diff or inference.

Diff:
<PASTE DIFF OR FILE HUNKS HERE>
```

---

## Prompt 2 — Risk flags (auth, Supabase, migrations)

**When to use:** After the summary, when any auth, data, or schema files changed
(see also `docs/ci/project-ci-inventory.md`).

**Copy-paste prompt:**

```text
You are a security-and-data risk assistant for PREIshare. Review the diff below
ONLY for risk signals. CI already runs typecheck/build/lint/test — do not repeat
style nits unless they hide a risk.

Flag risks in these buckets (skip a bucket if nothing relevant appears):
- Auth / session / route protection
- Supabase client usage and who can read or write which rows
- Migrations / schema / SQL
- Secrets, env vars, API keys, service-role usage
- Destructive or irreversible data changes

For each flag output:
- Severity: high | medium | low
- File and rough location
- Why it matters for PREIshare users or data
- A concrete question the human reviewer should ask

Hard rules:
- Do not approve or merge.
- Do not claim the code is safe.
- If unsure, mark needs human verification — never invent a pass.
- Prefer questions over verdicts.

Diff:
<PASTE DIFF OR FILE HUNKS HERE>
```

---

## Prompt 3 — Human review question checklist

**When to use:** Before you submit your GitHub review, to build a short checklist
tailored to this PR (not a generic blog checklist).

**Copy-paste prompt:**

```text
You help PREIshare reviewers prepare questions. From the PR description and diff
below, generate 5–8 review questions a human should answer before merging.

Rules for questions:
- Prefer PREIshare-specific topics: dashboard UX, TanStack Start routes/loaders,
  Supabase access, auth, migrations, and failure modes.
- Do not duplicate pure CI concerns (compile/type errors) unless the diff shows
  a likely gap in tests.
- Each question must be answerable by reading code, running the app, or asking
  the author — not by guessing.

Output format:
- Checklist of questions (markdown `- [ ]` items)
- Group lightly: Product / UX, Data & auth, Ops & rollback
- End with: Reminder: only a human may approve or merge this PR.

Hard rules:
- Do not approve, LGTM, or recommend merge.
- Do not speak as a required gate — speak as a helper.

PR description:
<PASTE PR BODY>

Diff:
<PASTE DIFF OR FILE HUNKS HERE>
```

---

## Optional follow-up — Map AI notes back to CI

If the assistant mentions something CI should have caught, open
`docs/ci/pipeline-design.md` and `.github/workflows/pr-ci.yml` and decide whether
to file a follow-up for the next sprint. Do **not** weaken human review to paper
over a missing automated check without a team decision.

## Human merge authority (non-negotiable)
- AI output in this pack is advisory only.
- Required status checks and branch protection (see
  `docs/ci/branch-protection-checklist.md`) remain the automated gates.
- A named human reviewer owns the GitHub review and the merge click.
- If AI and CI disagree with your judgment, trust evidence and teammates — not
  the model's confidence.
