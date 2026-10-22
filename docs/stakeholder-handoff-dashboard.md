# PREIshare Investor Dashboard — Stakeholder Handoff

**Sprint focus:** Responsive investor dashboard shell (TanStack Start routes + React UI)
**Audience:** PREIshare product stakeholders and the next implementation topic owners
**Date:** 2026-10-22
**Prepared by:** Kory Anderson

## 1. Demo today (what investors can click)

- From the repository root, `npm run dev` serves the app at `http://localhost:3000`. Open `http://localhost:3000/dashboard` (requirements brief; responsive QA tested this URL on branch `main` on 2026-10-22).
- `src/routes/dashboard/route.tsx` is the layout for the `/dashboard` area. It renders `AppShell` with `title="Overview"` and puts the active child route in `<Outlet />`.
- Navigation labels are Home, Portfolio, Deals, and Profile (`docs/dashboard-routing-plan.md`, from `src/components/layout/navConfig.ts`):
  - Home → `/dashboard` (`src/routes/dashboard/index.tsx`)
  - Portfolio → `/dashboard/portfolio` (renders `PortfolioTable`)
  - Deals → `/dashboard/deals` (renders `DealsList`)
  - Profile → `/dashboard/profile` (renders `ProfileCard`)
- There is no `/dashboard/activity` route. Recent activity is a region on the home page.
- Desktop and tablet: the architecture map keeps the sidebar in the shell from 768px up (sticky above 1024px) and hides the menu button. QA at 1280px: sidebar visible (D1), mobile nav not duplicating it (D2). QA at 768px: one navigation pattern, header and content not cramped (T2, T3).
- Narrow width: below 768px the sidebar is out of the flow. A header menu opens MobileNav over the page; closing it returns to main and the shell does not navigate away. QA at 375px: no horizontal page scroll (M1), header usable (M2), desktop sidebar not covering content (M3), menu visible (“Nav Menu visable on top”, M4), menu opens and closes links (M5).
- Home composition (`src/routes/dashboard/index.tsx`):
  - Heading “Investor dashboard” and the sentence “Figures below are placeholders until live data is connected.”
  - Three metric cards: Portfolio value, Active investments, Distributions (YTD). Each `value` is `—`, with hints “Connect data to see live totals”, “No investments loaded yet”, and “Figures appear after sync”.
  - `PortfolioSummary` with an empty holdings list. Empty message: “No portfolio holdings to show yet. When your account is linked, summaries will appear here.”
  - `RecentActivity` with an empty items list. Empty message: “No recent activity yet. Distributions, documents, and updates will list here.”
- QA also passed metric-card layout, `PortfolioSummary`, `RecentActivity`, and empty-state visibility at the tested widths (M7–M10, T4–T5, D4–D5), plus keyboard focus, no layout jump when the menu opens, and metrics before lists on small screens (X1–X3).
- The starter routes `/` and `/about` stay in place. The routing plan notes that `src/routes/index.tsx` links to `/dashboard`.

**Out of scope for this demo** (requirements brief, section 5; same list in the architecture doc): real Supabase queries, balances, or pgvector search; authentication, roles, and permissions; payments, documents vault, and tax exports; a polished design system beyond a clean functional layout; charts that need live time-series data. Login/signup has no route. The home route comment says shell demo data only, to be replaced with loaders/Supabase in a later topic.

## 2. Requirements traceability

Criteria are copied verbatim from `docs/preishare-dashboard-requirements.md`, section 6.

| Success criterion (from requirements brief) | Status | Evidence |
| --- | --- | --- |
| An investor can open the dashboard home route in the browser (`http://localhost:3000/dashboard` while `npm run dev` is running from the repository root). | Met | `src/routes/dashboard/index.tsx` (`createFileRoute('/dashboard/')`) inside layout `src/routes/dashboard/route.tsx`. `docs/responsive-qa-checklist.md`: App URL tested `http://localhost:3000/dashboard` on 2026-10-22, branch `main`; sign-off “Ready for stakeholder handoff draft: Yes”. |
| Header, navigation, metrics, and activity regions are all visible on desktop. | Met | Architecture: Header, Sidebar, and Main are chrome/main; desktop (> 1024px) shows a sticky sidebar, a 3-column metric grid, and summary plus activity. QA at 1280px: D1 sidebar Pass, D4 metric cards Pass, D5 PortfolioSummary + RecentActivity Pass. Home renders those widgets in `src/routes/dashboard/index.tsx`. Layout renders `AppShell` in `src/routes/dashboard/route.tsx`. |
| On a narrow (mobile) width, navigation remains usable (a mobile nav pattern, not a sidebar that covers or breaks the page). | Met | Architecture: below 768px the sidebar is hidden; MobileNav opens from the header menu and closes from that control, a backdrop tap, or a chosen link. QA at 375px: M3 Pass, M4 Pass (“Nav Menu visable on top”), M5 Pass, M1 no horizontal page scroll Pass. |
| Placeholder content is clearly labeled so stakeholders know data is not live. | Met | `src/routes/dashboard/index.tsx`: “Figures below are placeholders until live data is connected.” Metric values are `—` with non-live hints. Empty holdings and activity lists render the `emptyMessage` strings on `PortfolioSummary` and `RecentActivity`. QA M10 empty-state messaging Pass. |
| What was built matches this brief (no surprise mega-features). | Partial | Home route is placeholder copy and empty lists only (`src/routes/dashboard/index.tsx` comment: “Shell demo data only”). Routing plan: no login/signup route, no `src/routes/api/`, no Supabase queries on these routes. Partial because `src/routes/dashboard/portfolio.tsx`, `deals.tsx`, and `profile.tsx` only show that they render `PortfolioTable`, `DealsList`, and `ProfileCard`. The architecture doc says those three are outside the shell inventory, and brief section 3 limits nested pages to short empty states. This handoff does not inspect those component bodies. |
| A teammate can read this brief and understand scope in under 5 minutes. | Partial | `docs/preishare-dashboard-requirements.md` is written for beginner builders and includes a terms table, must-have vs later (section 5), and the six checks in section 6. None of the four docs records a timed teammate read, so “under 5 minutes” is not evidenced. |

## 3. Decisions made (so the next topic does not re-litigate them)

- **Routing:** Dashboard URLs stay on the file-based tree in `docs/dashboard-routing-plan.md`. Layout: `src/routes/dashboard/route.tsx` (`createFileRoute('/dashboard')`, `AppShell` + `<Outlet />`). Home: `src/routes/dashboard/index.tsx` (`createFileRoute('/dashboard/')`). Children: `/dashboard/portfolio`, `/dashboard/deals`, `/dashboard/profile`. Do not add `src/routes/dashboard.tsx` beside the layout file. Do not add `/dashboard/activity`. Do not hand-edit `src/routeTree.gen.ts`. Leave `/`, `/about`, and `src/routes/__root.tsx` in place.
- **Activity placement:** Recent activity is a home-page region (`RecentActivity` in `src/routes/dashboard/index.tsx`). The routing plan’s open question stands: add `/dashboard/activity` only if a later prompt asks for a full activity feed.
- **Deals and profile:** The brief’s screen table does not name them. The routing plan keeps both routes and nav items so existing links stay valid. Profile remains an account-area placeholder; auth and account management stay later (brief section 5).
- **Shell regions:** `AppShell` places Header, Sidebar/MobileNav, and Main. The layout route passes the outlet as `children` and sets `title` to “Overview”. The home page heading in `index.tsx` is “Investor dashboard”. The routing plan records the layout header strings “PREIshare” / “Investor Dashboard” and index placeholder “Welcome back”; those strings are not the ones in the current route files. Architecture Header spec: PREIshare branding, optional title (default “Dashboard”), and a static “Investor” label that is not a session. No account menu and no sign-out.
- **Nav labels:** Home, Portfolio, Deals, Profile. Sidebar marks the link whose path matches the current URL. Same four destinations on MobileNav.
- **Widgets:** Home composes separate components so later data wiring can keep the page structure: `MetricCard` (`label`, `value`, `hint`), `PortfolioSummary` (`emptyMessage` when there are no holdings), `RecentActivity` (`emptyMessage` when there are no items). The home route currently passes empty holdings and activity arrays, so the empty messages are what the demo shows.
- **MetricCard file:** The home route imports `MetricCard` from `src/components/dashboard/MetricCard`. The architecture file-target table still says the tile lives in `src/components/dashboard/StatsCard.tsx` and says not to add a second `MetricCard.tsx`.
- **Responsive approach:** One nav rule from the architecture doc: sidebar visible from 768px up, including tablet; it is not a second collapsible mode on tablet. MobileNav is only below 768px (`max-width: 767px` in `src/styles/dashboard.css` and in AppShell, per that doc). Menu control touch size is `--dash-touch-min: 44px`. QA widths actually exercised: mobile 375px, tablet 768px, desktop 1280px. All rows M1–M10, T1–T6, D1–D6, and X1–X3 are Pass. Home metric classes in `index.tsx` are `grid gap-4 sm:grid-cols-2 xl:grid-cols-3`. Summary and activity sit in `grid gap-6 lg:grid-cols-5`.
- **Document title:** The routing plan notes that `__root.tsx` sets the document title to “PREIshare Investor Dashboard” for every page, including `/` and `/about`. Per-route titles are outside the routing plan and the architecture blueprint.

## 4. Known limitations (honest baseline)

- **Mock data only:** Home metrics use `—` and placeholder hints. Portfolio holdings and activity items are empty arrays in `src/routes/dashboard/index.tsx`. The requirements brief and the architecture doc both leave real Supabase, PostgreSQL, pgvector, and balances for later. The routing plan states that auth guards and loader data are not on these routes today.
- **Auth not wired:** The actor is described as a signed-in investor, and sign-in is out of scope (brief section 5; architecture). Anyone who can open `/dashboard` gets the shell. Header’s “Investor” label is specified as static text, not a session.
- **No mutations in this shell:** The architecture out-of-scope list includes editing portfolio holdings, live trades, and other deep investment tools. The home route is read-only placeholder UI. Child routes mount `PortfolioTable`, `DealsList`, and `ProfileCard`; their internals are not part of this handoff’s sources.
- **Nested pages vs “short empty state”:** Brief section 3 asks for minimal nested pages that can be a short empty state. The route files render existing page components. Treat live portfolio detail as still later until those components are reviewed against section 5.
- **Architecture “today” notes are behind the home route:** The architecture doc says the index does not render metric cards, portfolio summary, or the activity list, and that widget composition comes later. `src/routes/dashboard/index.tsx` already renders all three. It also says there is no separate MobileNav file yet and that the drawer reuses Sidebar until an extract to `src/components/layout/MobileNav.tsx`. QA treats MobileNav as the control that passed at 375px.
- **Copy strings differ across docs and routes:** Routing plan success text expects header “Investor Dashboard” and index “Welcome back”. The layout route passes `title="Overview"`. The home heading is “Investor dashboard”.
- **QA residual risks:** `docs/responsive-qa-checklist.md` “Known limitations” has no items listed. Every recorded check is Pass. Critical sign-off boxes M1–M7, T1–T5, and D1–D5 are checked. The targeted fix log (cycles 1–3) has no file, prompt, or result filled in, while the sign-off box “Fix log filled for every change made during QA” is checked. QA did not record a width between 768px and 1280px. M4’s note is “Nav Menu visable on top”.

## 5. Recommended next sprint work

1. Replace the home route’s shell demo data with loaders/server functions that read portfolio and activity from Supabase. The index comment and brief section 5 both leave that connection for a later topic. Keep balances and pgvector search inside that same data topic rather than sneaking them into the shell.
2. Add authentication, roles, and permissions, and guard `/dashboard`. The routing plan lists auth guards as a later sprint; none exist on these routes today. Brief section 5 still excludes login/signup from this shell.
3. Keep `MetricCard`, `PortfolioSummary`, and `RecentActivity` as the home widgets. Replace the `—` values and the empty arrays with loaded data, and keep each widget’s empty message for the no-data case (architecture props: `hint`, `emptyMessage`).
4. Re-run `docs/responsive-qa-checklist.md` at 375px, 768px, and 1280px after real content is connected, including long labels and a wide table on a child page. The architecture note says a wide table may scroll inside its own region so the shell itself does not scroll sideways.
5. Resolve the blueprint drift before the next UI topic: update `docs/dashboard-component-architecture.md` so it matches the home route (widgets are composed; `MetricCard` is the imported tile) and records where MobileNav actually lives. Align the visible title strings (“Overview”, “Investor dashboard”) with the routing plan’s “Investor Dashboard” / “Welcome back” only if stakeholders want those words.
6. Leave `/dashboard/activity`, payments, documents vault, tax exports, and live time-series charts out until a prompt asks for them (routing plan open question; brief section 5). Review `PortfolioTable`, `DealsList`, and `ProfileCard` against the “short empty state” rule before extending them.

## 6. Artifact index (for handoff package)

- Requirements: `docs/preishare-dashboard-requirements.md`
- Routing plan: `docs/dashboard-routing-plan.md`
- Component architecture: `docs/dashboard-component-architecture.md`
- Responsive QA: `docs/responsive-qa-checklist.md`
- Routes: `src/routes/dashboard/route.tsx`, `src/routes/dashboard/index.tsx` (also `src/routes/dashboard/portfolio.tsx`, `src/routes/dashboard/deals.tsx`, `src/routes/dashboard/profile.tsx`)
