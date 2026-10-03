# PREIshare Investor Dashboard Shell — Verification Checklist

**Sprint:** 3 (TanStack Start UI shell)  
**Verifier:** Kory Anderson  
**Date:** 2026-10-03  
**App URL tested:** http://localhost:3002  
**Sources of truth:** `docs/investor-dashboard-brief.md`, `docs/dashboard-ia.md`, `docs/component-plan.md`

Ports 3000 and 3001 were already in use, so this walkthrough used the Vite dev server on port 3002.

## How to use this checklist

- **Pass** — requirement met; evidence describes what you saw.
- **Fail** — in-scope shell issue; fix before handoff or note the fix commit.
- **Deferred** — intentionally out of scope for this sprint; reason required.

---

## 1. Routing and information architecture

| ID | Check | Status | Evidence |
|----|--------|--------|----------|
| R1 | `/dashboard` (or agreed home) loads dashboard home inside AppShell | Pass | Opened /dashboard — header title Dashboard overview, stats row visible inside the shell |
| R2 | `/dashboard/portfolio` loads portfolio page shell | Pass | Opened /dashboard/portfolio — header title Your portfolio, mock holdings visible |
| R3 | `/dashboard/deals` loads deals page shell | Pass | Opened /dashboard/deals — header title Open deals, mock deals visible |
| R4 | `/dashboard/profile` loads profile page shell | Pass | Opened /dashboard/profile — header title Your profile, mock member fields visible |
| R5 | Unknown paths do not break the whole app (sensible fallback or framework 404) | Pass | Opened /not-a-route — page showed "Not Found" and the rest of the app still loaded |

---

## 2. Navigation labels and active states

| ID | Check | Status | Evidence |
|----|--------|--------|----------|
| N1 | Sidebar/nav labels match brief/IA (Home/Dashboard, Portfolio, Deals, Profile) | Pass | Sidebar labels are Home, Portfolio, Deals, Profile, matching the IA one-word labels |
| N2 | Active nav item highlights the current route | Pass | Current link uses `nav-link-active` and `aria-current="page"`: Home on /dashboard, Portfolio on /dashboard/portfolio, Deals on /dashboard/deals, Profile on /dashboard/profile |
| N3 | Header page title updates when changing routes | Pass | Titles followed the route: Dashboard overview, Your portfolio, Open deals, Your profile |
| N4 | Nav links use client routing (no full page reload flash if applicable) | Pass | After hydration, clicks on Portfolio, Deals, Profile, and Home changed the path, title, and active link without reloading the page |

---

## 3. Layout shell and responsiveness

| ID | Check | Status | Evidence |
|----|--------|--------|----------|
| L1 | AppShell shows sidebar + header + main content on desktop | Pass | At 1280px, PREIshare sidebar (nav links), header title, and main content are all on screen; the menu button is hidden |
| L2 | Narrow viewport: nav remains usable (collapse, drawer, or stacked pattern) | Pass | At 375px the sidebar is collapsed and inert. "Open navigation" reveals Home, Portfolio, Deals, and Profile. Choosing Deals closed the drawer and showed Open deals |
| L3 | No permanent horizontal scroll on home/portfolio/deals/profile at ~375px width | Pass | At 375px, document scroll width matched the viewport on all four pages. Nothing outside the holdings table stuck out past the screen |
| L4 | Main content remains readable; cards/tables stack or scroll intentionally | Pass | Home stats, summary, and activity stack in one column. Deals cards stack. The holdings table scrolls inside its own wrapper (Property through Status stay readable) |
| L5 | Basic accessibility: buttons/links are keyboard-focusable; interactive controls have accessible names | Pass | Tab on desktop focused the Home link. Tab at 375px focused the "Open navigation" button. Nav links are named Home, Portfolio, Deals, Profile. Closed drawer links are removed from the tab order |

---

## 4. Mock content clarity (demo readiness)

| ID | Check | Status | Evidence |
|----|--------|--------|----------|
| M1 | Dashboard home: stats cards show labeled mock investor metrics | Pass | Cards read Total portfolio value $4.2M, Open deals 3, Holdings 4, each with a hint. Banner: "Demo shell — all figures are placeholders" |
| M2 | Portfolio summary / table shows clear placeholder holdings | Pass | Home summary lists Multifamily 45% $1.89M, Retail, Industrial, and Office, labeled sample data. Portfolio table shows Riverfront Lofts and Cedar Business Park with invested and current values |
| M3 | Deals list shows open-deal style placeholders | Pass | Harbor View Residences, Tampa, FL, Min. $25,000, Open; Summit Logistics Hub, Columbus, OH, Min. $50,000, Closing soon |
| M4 | Profile card shows member-style placeholder fields | Pass | Name Alex Morgan, email alex.morgan@example.com, Membership Preferred investor, Preferred contact Email, plus notes |
| M5 | No raw "TODO" / empty broken panels on primary views | Pass | Home, portfolio, deals, and profile each showed filled panels. No TODO text on those views |

---

## 5. Out-of-scope boundaries (must stay deferred)

| ID | Check | Status | Evidence / reason |
|----|--------|--------|-------------------|
| O1 | No real authentication / login gate required for shell demo | Deferred | Shell only; auth next sprint |
| O2 | No live Supabase/PostgreSQL data — mock data only | Deferred | Dashboard figures are inline mock constants. No Supabase client or live queries in `src` |
| O3 | No production deploy required for this verification | Deferred | Local dev server is enough |
| O4 | No payment, document vault, or admin tools added beyond brief | Pass | Investor pages are the four `/dashboard` routes. `/` and `/about` are the existing starter pages. No payment, vault, or admin UI |

---

## 6. Defects found and resolution

| Defect | Severity (blocker / polish) | Resolution | Re-check |
|--------|----------------------------|------------|----------|
| Closed phone nav still occupies about 33px (sidebar padding under `max-height: 0`) | polish | Accepted for handoff. Drawer still opens, lists the four links, and closes after a choice. It does not cause page-level horizontal scroll | Pass (L2, L3) |
| Header shows the page title only; component plan also calls for a compact identity placeholder | polish | Accepted for handoff. Member name and contact live on the profile card | Pass (N3, M4) |

No blocker defects. In-scope routing, navigation, layout, and mock-content checks passed on this walkthrough.

---

## 7. Sign-off for handoff

- [x] All **blocker** fails fixed or explicitly accepted with reason
- [x] Deferred items only cover agreed out-of-scope work
- [x] Shell is demoable against the PREIshare client story for Sprint 3

**Overall result:** Ready for stakeholder handoff

**Verifier signature:** Kory Anderson, 2026-10-03
