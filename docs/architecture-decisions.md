# Architecture Decisions — PREIshare Dashboard Shell (Sprint 3)

**Status:** Accepted for the Sprint 3 shell  
**Date:** 2026-10-03  
**Audience:** next-sprint owners and anyone changing investor routes, layout, or data

An architecture decision record states what we decided, why, and what follows. These four decisions describe the investor dashboard shell. They do not replace the client brief. If this file and the app disagree, trust `src/routes/dashboard/`, `src/components/layout/`, and `src/styles/dashboard.css`, then update this record.

Companion docs: [`docs/sprint3-handoff.md`](sprint3-handoff.md), [`docs/investor-dashboard-brief.md`](investor-dashboard-brief.md), [`docs/dashboard-ia.md`](dashboard-ia.md), [`docs/component-plan.md`](component-plan.md), [`docs/verification-checklist.md`](verification-checklist.md).

---

## ADR-001: TanStack Start with file-based routes

- **Context:** Each investor area needs a stable URL, and later sprints need a place to attach data loading without redesigning navigation. The information architecture already names four paths under `/dashboard`.
- **Decision:** Use TanStack Start and TypeScript file-based routing. `src/routes/dashboard.tsx` is the parent layout. Child files are `src/routes/dashboard/index.tsx` (`/dashboard`), `portfolio.tsx`, `deals.tsx`, and `profile.tsx`. The generated tree in `src/routeTree.gen.ts` stays generated (`npm run generate-routes`).
- **Consequences:** The URL map matches the IA. A new investor page is a route file plus a `dashboardNavItems` entry, not a hand-built router table. Loaders and server functions can attach to a route later without a rewrite. Unknown paths already fall through to the framework Not Found page.

## ADR-002: Shared AppShell layout

- **Context:** Home, Portfolio, Deals, and Profile all need the same chrome: sidebar, header, and a main content region. Duplicating that markup on each page would drift labels, titles, and the mobile drawer.
- **Decision:** `AppShell` (`src/components/layout/AppShell.tsx`) frames every dashboard page. The parent route renders `<AppShell><Outlet /></AppShell>`. `Sidebar`, layout `Header` (`src/components/layout/Header.tsx`), and `NavItems` read labels, paths, and titles from `dashboardNavItems` in `src/components/layout/navConfig.ts`. Page files render only their widgets.
- **Consequences:** Layout and drawer behavior change in one place. Page files stay focused on content. Adding a route is a config change plus a route file. The header currently shows the page title from `getPageTitle`. A compact member identity in the header was deferred; name and contact live on `ProfileCard`.

## ADR-003: Mock data boundary for the shell

- **Context:** Sprint 3 has to be demoable before authentication or a database exists. A hidden fake API would look like production and make the next swap harder to see.
- **Decision:** Widgets take simple props and fall back to inline mock constants. Examples: stats on `src/routes/dashboard/index.tsx`, `DEFAULT_MOCK_HOLDINGS` in `PortfolioSummary`, `mockHoldings` in `PortfolioTable`, `mockDeals` in `DealsList`, and `mockProfile` in `ProfileCard`. No Supabase client and no network fetch sit behind these components. The home page labels the figures with the banner “Demo shell — all figures are placeholders.”
- **Consequences:** Stakeholders can tell sample content from live holdings. Next sprint can replace a constant or a prop at the component or route boundary. Counts are not guaranteed to agree across widgets: the home card says 3 open deals while `DealsList` renders two. That drift stays visible until live queries own both numbers.

## ADR-004: Responsive CSS and an accessibility baseline

- **Context:** Investors will open the shell on a desktop and on a phone. Clutter and unlabeled controls undermine trust. A full brand system and a formal accessibility audit are out of scope for this sprint.
- **Decision:** Dashboard-specific layout and baseline accessibility live in `src/styles/dashboard.css`, imported from `src/routes/__root.tsx`. Desktop keeps a fixed sidebar. At `max-width: 767px` the sidebar collapses (`max-height: 0`) until `AppShell` adds `nav-open`. Card grids stack, then grow to two and three columns. Wide tables scroll inside `.dash-table-wrap`. Interactive targets use a 44px minimum, `:focus-visible` keeps a visible outline, and `prefers-reduced-motion: reduce` drops transitions. `NavItems` sets `aria-current="page"` on the active link. The closed drawer is removed from the tab order. Escape closes an open drawer.
- **Consequences:** The shell is demoable at 1280px and at 375px, which the verification checklist recorded as pass. A closed phone nav still reserves about 33px of sidebar padding; that was accepted as polish. Deeper contrast audits, a header identity placeholder, and production error boundaries are still ahead.

---

## Next sprint foundations

Do not reverse the four decisions above casually. The next sprint should build on this shell.

| Foundation | Why it builds on this shell |
| --- | --- |
| Supabase auth | Protect `/dashboard/*` at the parent layout route. Personalize the header and `ProfileCard` from the signed-in member instead of the Alex Morgan placeholder. |
| Live portfolio data | Replace mock stats, `PortfolioSummary`, and `PortfolioTable` through route loaders or server functions. Keep the mock constants out of the production path, and make the home “Open deals” count come from the same source as `DealsList`. |
| pgvector-powered search | Add search for deals or documents only after those rows live in Postgres. The deals route and `DealsList` are the UI boundary; do not invent a second catalog. |
| GitHub Actions CI | Gate pull requests with install, `npm run typecheck`, and `npm run build` on this package. Add `test` and `lint` scripts before requiring them. No workflow exists in the repo today. |

## Explicit non-goals for Sprint 3

- Real money movement, trading, or compliance workflows
- A final visual brand system
- Production deployment hardening
- Sign-in, live Supabase or PostgreSQL queries, payments, admin tools, and editing or saving a profile
