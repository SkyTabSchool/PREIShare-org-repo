# PREIshare Dashboard Routing Plan

## Purpose

Map investor-facing dashboard URLs to TanStack Start route files before any further UI generation.
Source requirements: `docs/preishare-dashboard-requirements.md`.

This plan records the route files already in `src/routes/` (look only; no new route files in this step). Later implementation should extend this tree. It should not replace the root layout or delete `/` and `/about`.

## Screens and navigation that need URLs

From the requirements brief (sections 2–4):

| Investor need | URL decision |
| --- | --- |
| Recognize the PREIshare investor area (header / branding) | Shared by the `/dashboard` layout. No extra URL. |
| Dashboard home: glanceable portfolio metrics plus a recent-activity list | `/dashboard` (index). Activity stays a region on this page. |
| Navigate among dashboard sections without losing the shell | Child routes under `/dashboard`, rendered in the layout outlet. |
| Deeper portfolio tools | `/dashboard/portfolio` (already a child page; live data is later). |
| Other nested sections so nav can change the main area | `/dashboard/deals` and `/dashboard/profile` (already present). |
| Login / signup | No route. Out of scope (brief section 5). |
| Live trades, payments, documents, tax exports | No routes. Out of scope. |

The brief’s example nested pages are “portfolio or activity.” Activity is a **home-page region** (metrics + activity list on the index), not its own path. Portfolio, deals, and profile are the nested destinations the sidebar already names.

## Current app inventory (as found)

Confirmed from `createFileRoute` / `createRootRoute` paths and `src/routeTree.gen.ts` (generated; not hand-edited). No `src/routes/api/` folder. No `dashboard/route.tsx`. No `dashboard/activity.tsx`.

| File / folder | Likely URL | Notes |
| --- | --- | --- |
| `src/routes/__root.tsx` | (app root layout) | Document shell (`html`, `head`, `body`, `Outlet`). Do not replace casually. |
| `src/routes/index.tsx` | `/` | Starter home. Links to `/dashboard`. |
| `src/routes/about.tsx` | `/about` | Starter about page. Leave in place. |
| `src/routes/dashboard.tsx` | `/dashboard` | **Layout route.** Wraps children in `AppShell` and renders `<Outlet />`. Parent file beside the `dashboard/` folder (TanStack layout convention used here). |
| `src/routes/dashboard/` | (folder) | Child routes of `/dashboard`. |
| `src/routes/dashboard/index.tsx` | `/dashboard` | **Index page.** Metrics cards, portfolio summary, recent activity, sample-data banner. Route id `/dashboard/`. |
| `src/routes/dashboard/portfolio.tsx` | `/dashboard/portfolio` | Child page. Renders `PortfolioTable`. |
| `src/routes/dashboard/deals.tsx` | `/dashboard/deals` | Child page. Renders `DealsList`. |
| `src/routes/dashboard/profile.tsx` | `/dashboard/profile` | Child page. Renders `ProfileCard`. |

Sidebar labels already match these paths in `src/components/layout/navConfig.ts`: Home, Portfolio, Deals, Profile.

## Planned dashboard route tree

Keep the tree that is already generated. Do not add a second layout file.

```text
/                          → src/routes/index.tsx (existing starter home; not part of the shell)
/about                     → src/routes/about.tsx (existing; leave alone)
/dashboard                 → layout (shell: header + sidebar + outlet) — src/routes/dashboard.tsx
/dashboard                 → index (investor home: metrics, portfolio summary, activity)
/dashboard/portfolio       → child (portfolio holdings; deeper tools later)
/dashboard/deals           → child (open deals)
/dashboard/profile         → child (investor profile placeholder)
```

`/dashboard/activity` is **not** in this tree. Recent activity is composed on the index. A full activity feed can be a later route if a prompt asks for one.

## File map

These files already exist. A later step should edit them in place. Do not create `src/routes/dashboard/route.tsx` alongside `src/routes/dashboard.tsx` (two layout files for the same path).

| URL | Role | File | Wraps / renders |
| --- | --- | --- | --- |
| `/dashboard` | Layout route | `src/routes/dashboard.tsx` | Shared dashboard chrome (`AppShell`); renders the child via `Outlet` |
| `/dashboard` | Index page | `src/routes/dashboard/index.tsx` | Investor dashboard home: metric cards, portfolio summary, recent activity |
| `/dashboard/portfolio` | Child page | `src/routes/dashboard/portfolio.tsx` | Portfolio holdings page inside the shell |
| `/dashboard/deals` | Child page | `src/routes/dashboard/deals.tsx` | Open-deals page inside the shell |
| `/dashboard/profile` | Child page | `src/routes/dashboard/profile.tsx` | Profile placeholder inside the shell |

## Layout vs page responsibilities

- **Layout (`src/routes/dashboard.tsx`)**: persistent navigation regions only (header, sidebar / mobile nav, main outlet). No metric-card business content.
- **Index (`src/routes/dashboard/index.tsx`)**: dashboard home composition (summary widgets and the activity list). Uses the parent layout.
- **Child pages**: real nav targets so the shell stays put while the main region changes. Fuller investment tools, live data, and account management stay later.

## Navigation labels (sidebar / mobile nav)

Labels already in `src/components/layout/navConfig.ts`. They use investor language from the brief (section 4), not file names.

| Label | Path | Requirement link |
| --- | --- | --- |
| Home | `/dashboard` | Investor home base: branding, portfolio metrics, recent activity |
| Portfolio | `/dashboard/portfolio` | Deeper portfolio view (live detail is later) |
| Deals | `/dashboard/deals` | Nested section so navigation changes main content |
| Profile | `/dashboard/profile` | Account-area placeholder. Auth and account management stay later (brief section 5) |

## Out of scope for this plan

- Component prop designs and styling tokens (next architecture step)
- Auth guards and loader data shape (later sprints; none are on these routes today)
- API routes and Supabase queries
- New route files in this step
- Deleting or rewriting `__root.tsx`, `index.tsx`, or `about.tsx`
- Hand-editing `src/routeTree.gen.ts`

## Success criteria for implementation steps

- Visiting `/dashboard` shows the layout shell and the home index content region.
- `/dashboard/portfolio`, `/dashboard/deals`, and `/dashboard/profile` render inside the same layout (the shell is not replaced by a blank full page).
- No unrelated existing routes (`/`, `/about`, `__root`) are deleted during dashboard work.
- Empty-state or sample-data copy stays visible so placeholders are not mistaken for live figures (brief sections 4–6).

## Open questions

- The brief allows a nested activity page as an example. This repo keeps activity on the home index and does not define `/dashboard/activity`. Add that path only if a later prompt asks for a full activity feed.
- Deals and profile are not named in the brief’s screen table, but both routes and nav items already exist. This plan keeps them so existing links stay valid.
- The layout file is `src/routes/dashboard.tsx`, not `src/routes/dashboard/route.tsx`. Leave that convention unless a later task migrates it on purpose.
- `__root.tsx` sets the document title to “PREIshare Investor Dashboard” for every page, including `/` and `/about`. Per-route titles are outside this routing plan.
