# PREIshare dashboard — responsive QA checklist

**Tester:** Kory Anderson
**Date:** 2026-10-22
**App URL tested:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
**Build / branch:** main

## Breakpoints used


| Name    | Width  | How to set              |
| ------- | ------ | ----------------------- |
| Mobile  | 375px  | Devtools device toolbar |
| Tablet  | 768px  | Devtools device toolbar |
| Desktop | 1280px | Devtools device toolbar |


## How to use this sheet

1. Load the dashboard route with the dev server running.
2. For each row, set the width, perform the check, mark **Pass** or **Fail**.
3. On Fail, write a short **Symptom** and which **file** you will ask the agent to touch.
4. After a targeted fix, re-test and update **Status** and **Fix notes**.
5. Critical rows must Pass (or be listed under Known limitations with stakeholder-safe wording).

---



## Mobile (~375px)


| ID  | Check                                                                      | Status (Pass/Fail) | Symptom / notes                | Fix notes (prompt + files) |
| --- | -------------------------------------------------------------------------- | ------------------ | ------------------------------ | -------------------------- |
| M1  | No horizontal page scroll                                                  | Pass               | Works even on smaller viewport | N/A                        |
| M2  | Header remains visible and usable                                          | Pass               | N/A                            | N/A                        |
| M3  | Desktop sidebar is hidden or off-canvas (not permanently covering content) | Pass               | N/A                            | N/A                        |
| M4  | MobileNav or menu control is visible                                       | Pass               | Nav Menu visable on top        | N/A                        |
| M5  | Menu opens and closes navigation links                                     | Pass               | N/A                            | N/A                        |
| M6  | Main content readable without pinched text                                 | Pass               | N/A                            | N/A                        |
| M7  | Metric cards stack in a single column (or intentional narrow grid)         | Pass               | N/A                            | N/A                        |
| M8  | PortfolioSummary does not overflow or clip                                 | Pass               | N/A                            | N/A                        |
| M9  | RecentActivity list wraps; no cut-off timestamps/labels                    | Pass               | N/A                            | N/A                        |
| M10 | Empty-state messaging (if shown) is fully visible                          | Pass               | N/A                            | N/A                        |




## Tablet (~768px)


| ID  | Check                                                                      | Status (Pass/Fail) | Symptom / notes | Fix notes (prompt + files) |
| --- | -------------------------------------------------------------------------- | ------------------ | --------------- | -------------------------- |
| T1  | No horizontal page scroll                                                  | Pass               | N/A             | N/A                        |
| T2  | Navigation pattern matches plan (sidebar, rail, or menu—not both fighting) | Pass               | N/A             | N/A                        |
| T3  | Header + content spacing not cramped                                       | Pass               | N/A             | N/A                        |
| T4  | Metric cards use a sensible 2-column (or planned) layout                   | Pass               | N/A             | N/A                        |
| T5  | PortfolioSummary and RecentActivity share space without overlap            | Pass               | N/A             | N/A                        |
| T6  | Touch targets / click targets large enough to use                          | Pass               | N/A             | N/A                        |




## Desktop (~1280px)


| ID  | Check                                                        | Status (Pass/Fail) | Symptom / notes | Fix notes (prompt + files) |
| --- | ------------------------------------------------------------ | ------------------ | --------------- | -------------------------- |
| D1  | Sidebar visible and usable per architecture                  | Pass               | N/A             | N/A                        |
| D2  | MobileNav hidden or not duplicating full sidebar awkwardly   | Pass               | N/A             | N/A                        |
| D3  | Main region has comfortable padding/margins                  | Pass               | N/A             | N/A                        |
| D4  | Metric cards align in a multi-column row as planned          | Pass               | N/A             | N/A                        |
| D5  | PortfolioSummary + RecentActivity sit in intended regions    | Pass               | N/A             | N/A                        |
| D6  | Long labels/numbers do not break the header or sidebar width | Pass               | N/A             | N/A                        |




## Cross-cutting issues


| ID  | Check                                                                               | Status | Notes |
| --- | ----------------------------------------------------------------------------------- | ------ | ----- |
| X1  | Focus order / keyboard: menu and links reachable                                    | Pass   | N/A   |
| X2  | No layout jump when opening/closing mobile menu                                     | Pass   | N/A   |
| X3  | Stacking order: important metrics appear before low-priority lists on small screens | Pass   | N/A   |




## Targeted fix log (one row per prompt cycle)


| Cycle | Breakpoint | File(s) touched | Prompt summary (one sentence) | Result after re-test |
| ----- | ---------- | --------------- | ----------------------------- | -------------------- |
| 1     |            |                 |                               |                      |
| 2     |            |                 |                               |                      |
| 3     |            |                 |                               |                      |




## Known limitations (optional)

List anything still imperfect that you are **not** fixing in this sprint, with a reason (e.g. “Chart library deferred to next topic”).

- 

## Sign-off

- [x] Critical mobile checks M1–M7 pass
- [x] Critical tablet checks T1–T5 pass
- [x] Critical desktop checks D1–D5 pass
- [x] Fix log filled for every change made during QA
- [x] Touched components still match the architecture (no accidental full rewrite)

**Ready for stakeholder handoff draft:** **Yes** / No