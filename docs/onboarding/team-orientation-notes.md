# PREIshare team orientation notes

Welcome to PREIshare. This document is the beginner-friendly orientation for joining the team. Read it on your own. You should not need a meeting to understand how we work, what we build, or when a pull request is ready for review.

The required sections are **Mission**, **Workflow mapping table**, **PR actors**, **Definition of done**, **Out of scope**, and **AI-use stance**.

## Mission

PREIshare is a real-estate intelligence product. Our mission is to help investors make intelligent decisions.

That means the product should:

- Turn property and market information into something an investor can actually use
- Make risk, opportunity, and comparisons easy to see
- Stay trustworthy: numbers, sources, and assumptions should be clear enough that someone can act on them

PREIshare is a modern web app. People use it in a browser. We deliver the mission with a small, shared set of tools so the whole team can read, review, and ship the same kind of work:

- **TypeScript** is the language we write most of the app in. It is JavaScript with extra labels (called types) that describe what kind of data a piece of code expects. Those labels help us catch mistakes before investors see them.
- **React** is how we build the screens people see. Screens are made of components: small, reusable pieces of interface such as a property card or a search field.
- **TanStack Start** is the framework that holds the web app together. It sits on top of React and handles pages, moving between screens, and how the app is served.
- **Supabase** is the hosted backend for product data and related services, such as storing records, reading them back, and controlling who can see what.
- **PostgreSQL** is the database where lasting product data lives. Treat it as the source of truth.
- **pgvector** is a PostgreSQL extension for storing and searching vectors (lists of numbers that can represent meaning). We use it for “find things like this” behavior, such as similar properties, not only exact matches.

When you work on PREIshare, ask: **does this change help an investor decide more intelligently?** If the answer is no, the change does not serve the mission.

## Workflow mapping table

The team uses Git and GitHub to manage source control. Source control means there is one shared history of the product. GitHub is where that history lives, and it is how we make sure **only verified features are pushed into production**.

Production is the live product investors use. A change is not part of PREIshare just because it works on your computer.

This table maps everyday team work to the GitHub pieces that carry it. You can follow the workflow in GitHub’s website. You do not need command-line steps to understand it.

| Team step | GitHub piece | What it is for | Beginner note |
| --- | --- | --- | --- |
| Share one product history | The PREIshare repository | Source control for the whole team | Everyone works from the same product, not private copies that never get reviewed. |
| Start a change | A **feature branch** | A separate line of work for one focused change | Do this instead of editing `main` or `master`. Those names are the shared production line. |
| Ask the team to verify | A **pull request** (PR) | A written request to review and, if it looks good, fold the change into the shared product | The PR must explain what changed and why. It should be enough on its own. |
| Protect investors | Review and approval on the PR | Human verification against the definition of done | Review happens *before* work lands on `main` or `master`, not after. |
| Ship a verified feature | Merge the approved PR, then production | Move reviewed work toward the live app | Unreviewed work must not reach production. |

Usual path, in order:

1. Do the work on a feature branch, not on `main` or `master`.
2. Open a pull request that is focused, explained, and self-contained.
3. The people listed in **PR actors** review it against the **Definition of done**.
4. After approval and merge, the change can move toward production.

## PR actors

A pull request is a team conversation, not a solo handoff. These are the people (and one system role) involved.

### Author

The author is the person who made the change and opened the pull request.

The author is responsible for:

- Keeping the request focused (one job, not a multi-feature rewrite)
- Working on a feature branch, not `main` or `master`
- Writing what changed and why the request was made
- Making the request self-contained so nobody needs a meeting to review it
- Following team standards, including the PREIshare stack above
- Understanding the change well enough to answer questions

If an AI tool helped draft the work, the author still owns every line. See **AI-use stance**.

### Reviewer

A reviewer is a teammate who reads the pull request and the change.

The reviewer checks the **Definition of done**, asks questions in the request itself, and says whether the work is safe to fold into the shared product. Reviewers should not need a side meeting or a chat thread to understand the request.

### Approver

An approver is a reviewer (or maintainer) who records that the request meets the bar. Approval means: this is focused, explained, on the right branch, standards-following, and ready to move toward production.

### Maintainer

A maintainer is someone trusted to merge an approved pull request into the shared branch (`main` or `master`). Maintainers keep unreviewed work off that branch so production only receives verified features.

### GitHub (system)

GitHub holds the branches, the pull request, the comments, and the record of approval. It does not replace human review. Automated checks, when we have them, are extra signal. They are not a substitute for a teammate confirming the definition of done.

Investors are not pull request actors. They feel the result in production after the team has verified the work.

## Definition of done

A pull request is not done just because the code runs. The team considers a request **done** only when all of the following are true.

### The request is focused

The request covers **one** clear change: one feature, one fix, or one improvement.

It is not a multi-feature rewrite. Mixing unrelated changes makes review harder, hides risk, and makes it painful to undo one part later.

If you describe the work with “and” several times (“this adds search **and** redesigns the dashboard **and** changes how we store prices”), split it into separate requests.

### The work is not on main or master

The changes live on a feature branch, **not** on `main` or `master`.

Those shared branches are where verified work belongs. Putting a pull request’s work there skips the protection the team relies on.

If the work is sitting on `main` or `master`, move it onto its own branch and open the request from there.

### The request details all that changed and why it was made

The pull request text must spell out:

- **What changed** — the screens, behavior, data, or files involved, in plain language
- **Why the request was made** — the investor problem, bug, or team need that justified the work

A title like “updates” is not enough. Include how someone can check that the change works, plus anything a reviewer would otherwise have to guess.

### The request is self-contained

The pull request should be **all that is needed to understand it**. A reviewer should not have to hold a meeting, search through chat, or ping the author for missing context.

Self-contained means the request includes the problem or goal, the approach, what to look at, how to verify, and any risks or follow-ups.

If a screenshot, example, or short note would prevent a meeting, put it in the request. Meetings are still useful for hard design tradeoffs. They are not a substitute for writing down what the request is.

### The request follows team standards

The change matches how PREIshare is already built:

- TypeScript, TanStack Start, React, Supabase, PostgreSQL, and pgvector
- Existing naming, file layout, and review habits
- Clear, investor-facing language in the product
- No surprise extra tools or parallel systems unless the team has already agreed to them

“It works on my machine” is not the standard. “It fits PREIshare, and another teammate can review it without extra ceremony” is the standard.

### Done checklist

If any item is no, the request is not done yet.

- [ ] This request does one job, not several unrelated jobs
- [ ] The work is on a feature branch, not `main` or `master`
- [ ] The request text details all that changed
- [ ] The request text explains why the request was made
- [ ] Someone new to the work could review it without a meeting
- [ ] The change follows existing PREIshare patterns and tools
- [ ] You would be comfortable seeing this go to production after review

## Out of scope

This section lists what these notes are **not**, and what a single pull request must **not** try to be. Keeping scope tight is how the team stays focused.

**These notes do not cover**

- A full product roadmap, hiring plan, or architecture rewrite
- Command-line Git usage (the workflow above is described in GitHub terms on purpose)
- Creating extra folders, extra apps, or extra repositories as part of everyday contribution
- Local machine setup, secrets, or production access
- Investor support, legal advice, or underwriting someone else’s deal

**A pull request is out of scope when it**

- Rewrites several features at once
- Lands work on `main` or `master` instead of a feature branch
- Leaves out what changed or why the request was made
- Requires a meeting before a teammate can understand it
- Introduces a new language, framework, database, or host next to TypeScript, TanStack Start, React, Supabase, PostgreSQL, and pgvector
- Mixes formatting-only churn with a behavior change
- Treats an AI draft as finished work the author cannot explain

If the work is out of scope for one request, split it or stop and write a smaller request that meets the definition of done.

## AI-use stance

The team may use AI tools (including coding assistants) to draft code, tests, copy, and pull request text. AI is a helper. It is not an author, a reviewer, or a way around the definition of done.

**Allowed**

- Asking an assistant to help you understand existing PREIshare code
- Drafting a focused change in TypeScript, TanStack Start, React, Supabase, PostgreSQL, or pgvector
- Drafting pull request text that states what changed and why
- Checking your own work against the done checklist before you ask for review

**Required**

- You remain the **author**. If you cannot explain the change, it is not ready.
- The pull request still has to be focused, off `main` / `master`, fully described, self-contained, and aligned with team standards.
- You review AI output the same way a teammate will: for correctness, scope, and fit with PREIshare.
- You never paste secrets, private investor data, or production credentials into an AI tool or into a pull request.

**Not allowed**

- Using AI to produce a multi-feature rewrite and opening it as one request
- Asking AI to invent a new stack, a new folder tree, or a parallel product
- Copying generated text you have not read into the pull request description
- Treating “the assistant wrote it” as a reason to skip review
- Generating git command recipes in team docs (this orientation stays in GitHub language so beginners can follow it)

Reviewers review the change and the written request, not the tool that helped type them. If AI-generated work fails the definition of done, the author fixes it before asking again.

## How to use these notes

Keep this document nearby when you open a pull request. You do not need to memorize it.

The mission tells you **why** PREIshare exists. The workflow table tells you **how** work moves. The actors tell you **who** does what. The definition of done tells you **when** a request is finished. Out of scope and the AI-use stance tell you what not to mix in.

Focused, well-explained, standards-following requests are how PREIshare stays a product investors can trust, and how this team keeps shipping verified work into production.