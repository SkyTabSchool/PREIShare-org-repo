# PREIshare Dashboard — Component Architecture & Responsive Layout Map

## Purpose

Blueprint for the investor dashboard **shell** only. Implementation agents must
follow these names, regions, and responsive rules. No real portfolio API yet—
placeholder content is OK in later UI steps.

**Actor:** Investor. Treat whoever opens `/dashboard` as that signed-in investor.
Sign-in itself is out of scope (requirements brief, section 5).

**Goals on first visit** (requirements brief, section 2):

1. Recognize the PREIshare investor area (branding in the header).
2. Move among dashboard sections without losing the shell.
3. See high-level portfolio metrics at a glance.
4. Scan recent activity related to their investments.

## Sources

- `docs/preishare-dashboard-requirements.md` — actor, regions, must-haves, success checks
- `docs/dashboard-routing-plan.md` — URLs, layout vs page split, navigation labels

## Layout regions

Chrome is the frame that stays put. Main is the scrollable area that changes with the route.

| Region | Role | Typical components | Chrome or main |
|--------|------|--------------------|----------------|
| Header | Top bar: product name, user/placeholder label | Header | Chrome |
| Sidebar | Vertical nav on tablet and desktop | Sidebar | Chrome |
| Mobile nav | Overlay or drawer nav on small screens | MobileNav | Chrome |
| Main | Scrollable page content for the active route | Route outlet + widgets | Main |

AppShell is the frame that places Header, Sidebar/MobileNav, and Main together.
The dashboard layout route (`src/routes/dashboard/route.tsx`) renders `AppShell` and puts the active child route in the main slot (`<Outlet />` passed as `children`). The index page is placeholder copy. It does not render metric cards, the portfolio summary, or the activity list.

```text
Tablet and desktop (sidebar in the flow)
┌──────────────────┬──────────────────────────────┐
│ Sidebar          │ Header                       │
│  Home            │  PREIshare · Investor        │
│  Portfolio       ├──────────────────────────────┤
│  Deals           │ Main (scrolls)               │
│  Profile         │  child route outlet          │
│                  │  home widgets only on        │
│                  │  /dashboard                  │
└──────────────────┴──────────────────────────────┘

Mobile (sidebar out of the flow)
┌─────────────────────────────────┐
│ Header  [Menu]  PREIshare       │
├─────────────────────────────────┤
│ Main (scrolls, one column)      │
└─────────────────────────────────┘
Menu opens MobileNav over the page. Closing it returns to Main.
The shell does not navigate away.
```

## Routes this shell frames

Labels are investor words from `src/components/layout/navConfig.ts`. Do not show file names in the UI. Recent activity is a region on the home page. There is no `/dashboard/activity` route.

| Label | Path | What Main shows |
|-------|------|-----------------|
| Home | `/dashboard` | Placeholder home copy. Metric cards, portfolio summary, and recent activity belong on this page in a later step. |
| Portfolio | `/dashboard/portfolio` | Portfolio page already in the tree (deeper tools later) |
| Deals | `/dashboard/deals` | Open-deals page already in the tree |
| Profile | `/dashboard/profile` | Profile placeholder. Auth and account management stay later |

Leave `/`, `/about`, and `src/routes/__root.tsx` alone. The layout file is `src/routes/dashboard/route.tsx`. Do not add `src/routes/dashboard.tsx` beside it. Do not hand-edit `src/routeTree.gen.ts`.

## Component inventory

`AppShell` and `Header` for this frame live under `src/components/dashboard/`. Sidebar and nav labels stay under `src/components/layout/`. Home widgets also live under `src/components/dashboard/`. Later steps edit these files in place.

### AppShell

- **Region:** Chrome (the frame).
- **Responsibility:** Outer dashboard frame; arranges header, nav, and main.
- **Parent:** Dashboard layout route (`src/routes/dashboard/route.tsx`). The layout wraps `<Outlet />` in `AppShell`.
- **Children:** Header, a reserved sidebar region, and the main content slot.
- **Props (beginner):** `children` (the page content to show in main). Optional `title` is forwarded to Header. Optional `sidebar` fills the side region; until Sidebar is passed, the region shows a placeholder.
- **State:** AppShell owns whether the mobile nav is open. It closes the nav when the route changes. Header and MobileNav only receive that state.

### Header

- **Region:** Chrome.
- **Responsibility:** Top bar with PREIshare branding and a simple status/user placeholder. No account menu and no sign-out.
- **Parent:** AppShell.
- **Children:** none required. On small screens it also shows the menu button that opens MobileNav.
- **Props:** `title` (text, optional—default “Dashboard”, shown under the PREIshare brand). Optional `actions` for a later right-side slot.
- **Placeholder label:** a static word, “Investor”. It is not a signed-in profile and not a session object.

### Sidebar

- **Region:** Chrome.
- **Responsibility:** Tablet and desktop navigation links matching the routing plan. Hidden below 768px.
- **Parent:** AppShell.
- **Children:** nav links (plain links are fine). The link whose path matches the current URL is marked current so the investor can see which section they are in.
- **Props:** `items` (list of `{ label, to }` from the routing plan).
- **Items:** Home → `/dashboard`, Portfolio → `/dashboard/portfolio`, Deals → `/dashboard/deals`, Profile → `/dashboard/profile`. Read them from `dashboardNavItems` in `src/components/layout/navConfig.ts` (that file calls the path field `path`; pass it as `to`).

### MobileNav

- **Region:** Chrome.
- **Responsibility:** Small-screen navigation (menu button in the header + a panel/drawer). Same four destinations as Sidebar, with the same current-section mark.
- **Parent:** AppShell.
- **Children:** same destinations as Sidebar.
- **Props:** `items` (same shape as Sidebar); `open` and `onClose`. Open state lives in AppShell. MobileNav does not keep its own copy.
- **Today:** there is no separate `MobileNav` file yet. Below 768px the shell reuses Sidebar as the drawer and toggles it from Header. A later step may extract `src/components/layout/MobileNav.tsx`. Until then, keep one drawer and one list of links. Do not add a second set of destinations.

### MetricCard

- **Region:** Main (dashboard home only).
- **Responsibility:** One reusable metric tile (label + value + optional hint).
- **Parent:** Dashboard home (`src/routes/dashboard/index.tsx`).
- **Children:** none required.
- **Props:** `label` (text), `value` (text or number as text), `hint` (text, optional).
- **Empty / placeholder:** when a figure is not live, set `value` to a short placeholder (or “—”) and set `hint` to text that says the number is not live. Example hint: “Placeholder — not a live figure.”
- **Today:** this tile already exists as `StatsCard` in `src/components/dashboard/StatsCard.tsx`. Keep that file. Do not add a second `MetricCard.tsx` beside it.

### PortfolioSummary

- **Region:** Main (dashboard home only).
- **Responsibility:** Short summary block for the portfolio snapshot placeholder.
- **Parent:** Dashboard home.
- **Children:** none required (a simple list of lines is enough).
- **Props:** `headline` (text), `summaryLines` (list of text), `emptyMessage` (text when no data).
- **Empty state:** if `summaryLines` is empty, show `emptyMessage` and skip the list. Example: “No portfolio data connected yet.”
- **File:** `src/components/dashboard/PortfolioSummary.tsx`.

### RecentActivity

- **Region:** Main (dashboard home only). Not its own route.
- **Responsibility:** List of recent activity placeholders for the investor.
- **Parent:** Dashboard home.
- **Children:** none required.
- **Props:** `items` (list of `{ id, title, detail, timestamp }`), `emptyMessage` (text).
- **Empty state:** if `items` is empty, show `emptyMessage` and skip the list. Example: “No recent activity yet.”
- **File:** `src/components/dashboard/RecentActivity.tsx`.

Child routes may keep the page components they already render (`PortfolioTable`, `DealsList`, `ProfileCard`). Those are not part of this shell inventory. Do not move home widgets onto those pages as a substitute for later investment tools.

## Composition (dashboard home)

Main content on `/dashboard` should compose roughly:

1. A visible note that figures are placeholders (so nobody reads the shell as live balances).
2. A row/grid of MetricCard (three placeholders is enough — for example total value, open deals, holdings).
3. PortfolioSummary.
4. RecentActivity.

Empty states: each widget must support a clear empty message from the requirements brief. Sample numbers are allowed. They must be labeled as placeholders. Do not present them as production balances.

Nested pages (`/dashboard/portfolio`, `/dashboard/deals`, `/dashboard/profile`) render inside the same shell. Each can stay a short page. The shell (header + nav) stays in place while Main changes.

## Responsive behavior

One rule for navigation: **Sidebar is visible from 768px up. It is not a second collapsible mode on tablet.** MobileNav is only for widths below 768px. This matches the shell’s existing narrow breakpoint (`max-width: 767px` in `src/styles/dashboard.css` and in AppShell).

| Viewport | Approx width | Nav behavior | Main content |
|----------|--------------|--------------|--------------|
| Mobile | < 768px | Sidebar hidden. MobileNav opens from a menu button in the header and closes with the same control, a backdrop tap, or after a link is chosen. | Single column. Metric cards stack. Summary and activity stack. |
| Tablet | 768px–1024px | Sidebar visible in the shell (the existing sidebar width is fine). Menu button hidden. | Metric cards in a 2-column grid when space allows. Summary and activity may sit side by side. |
| Desktop | > 1024px | Sidebar visible and sticky in the shell. | Metric cards in a 3-column grid. Summary and activity side by side, or stacked, inside a max readable width so lines do not stretch across an ultra-wide monitor. |

Notes for implementers:

- Touch targets on mobile controls should be easy to tap. The menu button should be at least about 44px on each side (the shell already uses `--dash-touch-min: 44px`).
- Main content must remain scrollable. The header stays in the chrome and must not crowd out the page.
- Do not rely on hover-only actions for anything required on mobile. Current section, menu open/close, and empty states must work with tap and keyboard.
- The page must not force horizontal scrolling of the whole shell. A wide table on a child page may scroll inside its own region.

## File targets (for later steps—do not create all here)

Edit existing files. Add MobileNav only if a later prompt asks to split the drawer out of Sidebar.

| Component | File | What to do |
|-----------|------|------------|
| AppShell | `src/components/dashboard/AppShell.tsx` | Header, reserved sidebar region, main slot for `children`. |
| Header | `src/components/dashboard/Header.tsx` | PREIshare branding, optional title, Investor placeholder. |
| Sidebar | `src/components/layout/Sidebar.tsx` | Edit in place. Tablet/desktop links. |
| MobileNav | `src/components/layout/MobileNav.tsx` | Optional extract. Today the drawer is Sidebar. |
| Nav labels | `src/components/layout/navConfig.ts` | Source for Home, Portfolio, Deals, Profile. |
| MetricCard | `src/components/dashboard/StatsCard.tsx` | Edit in place. Do not add a second tile component. |
| PortfolioSummary | `src/components/dashboard/PortfolioSummary.tsx` | Edit in place. |
| RecentActivity | `src/components/dashboard/RecentActivity.tsx` | Edit in place. |
| Layout route | `src/routes/dashboard/route.tsx` | Wraps `<Outlet />` in `AppShell`. Keep the existing `createFileRoute('/dashboard')` config. |
| Home page | `src/routes/dashboard/index.tsx` | Placeholder home copy. Widget composition comes later. |

## Out of scope (prevent scope creep)

- Real Supabase, PostgreSQL, or pgvector queries, balances, or search
- Authentication, roles, permissions, login, and signup
- Payments, documents vault, tax exports, PDF export
- Charts libraries, map views, and live time-series charts
- Additional routes beyond the routing plan, including `/dashboard/activity`, unless a later prompt asks for a full activity feed
- A second layout file (`src/routes/dashboard.tsx`) or edits to `src/routeTree.gen.ts`
- Replacing or deleting `__root.tsx`, `/`, or `/about`
- Design-system package extraction or animation-heavy UI
- Editing portfolio holdings, live trades, or other deep investment tools
- Per-route document titles (the root layout title is outside this blueprint)

If a change belongs on the “later” list in the requirements brief (section 5), leave it out.

## Success criteria for this blueprint

- Every named component has one clear responsibility.
- Props are listed in plain language (no unexplained advanced patterns).
- Mobile / tablet / desktop nav behavior is explicit: drawer below 768px, visible sidebar from 768px up.
- Widget list matches investor dashboard home needs from the requirements brief: glanceable metrics, a portfolio summary, and recent activity, each with an empty or placeholder message.
- Navigation labels are Home, Portfolio, Deals, and Profile — the same paths as the routing plan.
- Out-of-scope section blocks accidental mega-features.

The shell those later steps build is done when the requirements brief (section 6) is true: `/dashboard` opens in the browser, chrome and home regions are visible on desktop, mobile nav still works on a narrow width, placeholders are labeled as not live, and the result stays inside this brief.
