# Sprint 3 Handoff — PREIshare Investor Dashboard Shell

**Audience:** stakeholders, next-sprint owners, PREIshare eng  
**Status:** Demo-ready shell. Ready for stakeholder handoff.  
**Date:** 2026-10-03  
**Verifier:** Kory Anderson  
**Package:** `preishare-investor-dashboard` (npm, TanStack Start, TypeScript, React 19, Vite, Tailwind CSS v4)

This sprint delivers a responsive investor dashboard **shell**. Members can move between Dashboard Home, Portfolio, Deals, and Profile without leaving the chrome. Numbers and lists are **mock data** so the UI can be demoed before live backend integration.

If this file and the app disagree, trust the route files under `src/routes/dashboard/` and the components under `src/components/`, then update this handoff.

---

## Stakeholder summary

PREIshare helps investors make intelligent decisions. Sprint 3 gives members a clean place to scan portfolio value, browse open deals, and review a profile.

The investor (member) is the only actor built this sprint. A future admin who might manage deals or users is mentioned in the brief and is not in the UI.

What a stakeholder should take away:

- Four investor areas, each with its own URL and page title, inside one shared shell.
- Persistent nav labeled Home, Portfolio, Deals, and Profile, with the current page highlighted.
- Desktop sidebar plus a phone drawer (`Open navigation` / Escape to close).
- Every figure on screen is a placeholder. The home page says so in a banner: “Demo shell — all figures are placeholders.”

## Brief highlights

Source: [`docs/investor-dashboard-brief.md`](investor-dashboard-brief.md).

| Investor goal | How the shell meets it |
| --- | --- |
| See a home overview immediately | `/dashboard` shows three stats cards, an allocation snapshot, and a recent-activity list |
| Reach Portfolio, Deals, and Profile without leaving the shell | Sidebar links stay on screen; the parent route wraps every child in `AppShell` |
| Trust the layout on phone and desktop | At 1280px the sidebar, header, and main region are all visible. At 375px the sidebar collapses into a drawer and page content does not force horizontal scroll |

Must-have areas from the brief, all present:

| Area | Route | What the investor sees |
| --- | --- | --- |
| Home overview | `/dashboard` | Stats cards, portfolio summary, recent activity |
| Portfolio | `/dashboard/portfolio` | Holdings table |
| Deals | `/dashboard/deals` | Open-deal cards |
| Profile | `/dashboard/profile` | Name and contact card |

Explicit non-goals kept out of this sprint: sign-in, live Supabase or PostgreSQL data, payments, admin tools, search, notifications, underwriting, and creating or saving real deals or profiles. The marketing starter pages `/` and `/about` remain; they are not investor dashboard areas.

## What shipped

- TanStack Start + TypeScript app with file-based routes under `src/routes/`.
- Dashboard layout route `src/routes/dashboard.tsx` renders `AppShell` and an `Outlet` for the four child pages.
- Shared chrome: `AppShell`, `Sidebar`, layout `Header`, `navConfig` (`dashboardNavItems`), and `NavItems` with `aria-current="page"` on the active link.
- Home widgets: `StatsCard`, `PortfolioSummary`, `RecentActivity`.
- Area shells: `PortfolioTable`, `DealsList`, `ProfileCard`.
- Responsive rules and a basic accessibility baseline in `src/styles/dashboard.css` (focusable controls, accessible names, drawer removed from tab order when closed).
- Verification walkthrough: [`docs/verification-checklist.md`](verification-checklist.md). Overall result: ready for stakeholder handoff. No blocker defects.

`npm run typecheck` is available (`tsc --noEmit`). There is no test or lint script in `package.json` yet.

## Route list

Investor routes (the full page set from the brief):

| URL | Route file | Route id | Nav label | Header title | Page component |
| --- | --- | --- | --- | --- | --- |
| `/dashboard` | `src/routes/dashboard/index.tsx` | `/dashboard/` | Home | Dashboard overview | `DashboardOverviewPage` |
| `/dashboard/portfolio` | `src/routes/dashboard/portfolio.tsx` | `/dashboard/portfolio` | Portfolio | Your portfolio | `PortfolioPage` → `PortfolioTable` |
| `/dashboard/deals` | `src/routes/dashboard/deals.tsx` | `/dashboard/deals` | Deals | Open deals | `DealsPage` → `DealsList` |
| `/dashboard/profile` | `src/routes/dashboard/profile.tsx` | `/dashboard/profile` | Profile | Your profile | `ProfilePage` → `ProfileCard` |

Parent layout: `src/routes/dashboard.tsx` (`/dashboard`) wraps those four pages in `AppShell`. Labels, paths, and titles live in `src/components/layout/navConfig.ts`.

Other routes that already existed and are outside the investor shell:

| URL | Route file | Role |
| --- | --- | --- |
| `/` | `src/routes/index.tsx` | Starter home |
| `/about` | `src/routes/about.tsx` | Starter about page |
| (unknown) | TanStack Router default | Renders “Not Found”; the rest of the app still loads |

Do not hand-edit `src/routeTree.gen.ts`. Add a route by adding a file and running `npm run generate-routes`.

## Component inventory

Locked names from [`docs/component-plan.md`](component-plan.md). Dashboard header is `src/components/layout/Header.tsx`. The older `src/components/Header.tsx` is starter chrome, not the investor shell.

### Layout (shared chrome)

| Component | File | Job |
| --- | --- | --- |
| `AppShell` | `src/components/layout/AppShell.tsx` | Sidebar, header, and `<main id="main-content">`. Closes the phone drawer on route change and on Escape. |
| `Sidebar` | `src/components/layout/Sidebar.tsx` | Brand and primary nav region. Collapses on viewports at or below 767px. |
| `Header` | `src/components/layout/Header.tsx` | Current page title and the “Open navigation” menu button on narrow screens. |
| `navConfig` | `src/components/layout/navConfig.ts` | `dashboardNavItems` plus `getPageTitle`. Does not render markup. |
| `NavItems` | `src/components/layout/NavItems.tsx` | Renders links from `navConfig` and marks the path that matches the URL. |

### Dashboard home (`/dashboard`)

| Component | File | Mock content on screen |
| --- | --- | --- |
| `StatsCard` | `src/components/dashboard/StatsCard.tsx` | Total portfolio value **$4.2M**, Open deals **3**, Holdings **4** |
| `PortfolioSummary` | `src/components/dashboard/PortfolioSummary.tsx` | Multifamily 45% $1.89M, Retail 25% $1.05M, Industrial 20% $840K, Office 10% $420K |
| `RecentActivity` | `src/components/dashboard/RecentActivity.tsx` | Cedar Court published (Sep 28, 2026), Maple & 4th under offer (Sep 14, 2026), Harbor Warehouse value updated |

### Page shells

| Component | File | Mock content on screen |
| --- | --- | --- |
| `PortfolioTable` | `src/components/dashboard/PortfolioTable.tsx` | Riverfront Lofts (Multifamily, invested $50,000, current $56,200, Performing); Cedar Business Park (Industrial, invested $75,000, current $74,100, Under review) |
| `DealsList` | `src/components/dashboard/DealsList.tsx` | Harbor View Residences, Tampa, FL, min. $25,000, Open; Summit Logistics Hub, Columbus, OH, min. $50,000, Closing soon |
| `ProfileCard` | `src/components/dashboard/ProfileCard.tsx` | Alex Morgan, alex.morgan@example.com, Preferred investor, preferred contact Email |

Mock rows are inline constants (or default props) inside those components. There is no fake API client.

## Verification checklist highlights

Full evidence: [`docs/verification-checklist.md`](verification-checklist.md). Walkthrough on **http://localhost:3002** (ports 3000 and 3001 were already in use). Sources of truth: the brief, [`docs/dashboard-ia.md`](dashboard-ia.md), and the component plan.

| Group | Result |
| --- | --- |
| R1–R5 Routing | Pass. All four dashboard URLs load inside the shell. `/not-a-route` shows Not Found. |
| N1–N4 Navigation | Pass. Labels match the IA. Active link uses `nav-link-active` and `aria-current="page"`. Header title follows the route. After hydration, sidebar clicks do not reload the page. |
| L1–L5 Layout | Pass at 1280px and 375px. Phone drawer lists the four links and closes after a choice. Holdings table scrolls inside its own wrapper. |
| M1–M5 Mock clarity | Pass. Home banner labels figures as placeholders. No TODO or empty broken panels on the four primary views. |
| O1–O3 Out of scope | Deferred on purpose: no auth gate, no live Supabase/PostgreSQL, no production deploy. |
| O4 Scope boundary | Pass. No payment, document vault, or admin UI. |

Accepted polish (not blockers):

- A closed phone nav still occupies about 33px because of sidebar padding under `max-height: 0`. The drawer still opens, lists the four links, and does not cause page-level horizontal scroll.
- The header shows the page title only. The component plan also calls for a compact identity placeholder in the header. Member name and contact live on the profile card for this handoff.

Sign-off: blocker fails none; deferred items match agreed out-of-scope work; shell is demoable against the Sprint 3 client story.

## How to run locally (cold start)

This repo uses **npm** (`package-lock.json`).

1. From the repo root, install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server (Vite, port **3000**):

   ```bash
   npm run dev
   ```

   If 3000 is taken, Vite will print another port. The verification walkthrough used **3002**.

3. Open the URL printed in the terminal and go to `/dashboard`.

Optional checks that exist today:

```bash
npm run typecheck
npm run build
npm run preview
```

## Short demo script

1. Open `/dashboard`. Point at the banner, then the three stats: portfolio value $4.2M, open deals 3, holdings 4. Show the allocation mix (Multifamily 45%) and the recent-activity list.
2. Use the sidebar: Portfolio (Riverfront Lofts, Cedar Business Park), Deals (Harbor View Residences, Summit Logistics Hub), Profile (Alex Morgan). Call out the header title and the highlighted nav item on each stop.
3. Resize to about 375px. Use **Open navigation**, pick Deals, and show the drawer close onto Open deals.
4. Say clearly: these values are mock placeholders for Sprint 3. They are not a member’s live portfolio.
5. Optional: open `/not-a-route` and show the Not Found page so the app does not blank out.

## Known limitations

- No real authentication or authorization. `/dashboard` is public.
- Portfolio, deals, profile, stats, and activity are mock or static. The home “Open deals” card says **3** while `DealsList` renders **two** deals. Treat that as placeholder drift, not a live count.
- Header has no compact member identity. Name and contact are only on `/dashboard/profile`.
- Closed mobile nav still reserves about 33px of sidebar padding.
- No Supabase client, PostgreSQL, or pgvector queries in `src` for this sprint.
- No GitHub Actions workflow. `package.json` has `typecheck` and `build`, and does not define `test` or `lint`.
- Not production-hardened: no app-wide error boundary, and empty states exist only where a widget already accepts an empty list (`PortfolioTable`, `DealsList`).
- `DealsList` and `ProfileCard` do not save, subscribe, or edit. Profile notes and deal minimums cannot be changed by the user.

## Recommended next-sprint work

1. Supabase auth and protected `/dashboard/*` routes, including a real member identity in the header.
2. Replace mock widgets with live portfolio and deals queries at the route or component boundary (loaders or server functions). Keep mock constants out of production paths. Align the home “Open deals” count with the deals list when data is live.
3. pgvector-powered search for deals or documents once rows live in Postgres.
4. GitHub Actions CI on pull requests: install, `npm run typecheck`, and `npm run build`. Add test and lint scripts before gating on them.
5. Empty, loading, and error states for each data widget, plus a fix for the closed-drawer 33px gap if mobile chrome is still in scope.

Foundations to keep: file-based routes under `src/routes/dashboard/`, one `AppShell`, and `dashboardNavItems` as the only nav list. Next sprint should add data at those boundaries rather than a second layout.

## References

- Client brief: [`docs/investor-dashboard-brief.md`](investor-dashboard-brief.md)
- Information architecture: [`docs/dashboard-ia.md`](dashboard-ia.md)
- Component inventory: [`docs/component-plan.md`](component-plan.md)
- Verification: [`docs/verification-checklist.md`](verification-checklist.md)
- Architecture decisions: [`docs/architecture-decisions.md`](architecture-decisions.md)
- Dashboard styles: `src/styles/dashboard.css`
- Nav source of truth: `src/components/layout/navConfig.ts`
