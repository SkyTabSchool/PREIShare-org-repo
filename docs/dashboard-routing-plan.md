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
| Dashboard home: glanceable portfolio metrics plus a recent-activity list | `/dashboard` (index). The index is placeholder copy for now. Activity stays a region on this page when those widgets are added. Do not add a separate activity URL. |
| Navigate among dashboard sections without losing the shell | Child routes under `/dashboard`, rendered in the layout outlet. |
| Deeper portfolio tools | `/dashboard/portfolio` (already a child page; live data is later). |
| Other nested sections so nav can change the main area | `/dashboard/deals` and `/dashboard/profile` (already present). |
| Login / signup | No route. Out of scope (brief section 5). |
| Live trades, payments, documents, tax exports | No routes. Out of scope. |

The brief’s example nested pages are “portfolio or activity.” Activity is a **home-page region** (metrics + activity list on the index), not its own path. Portfolio, deals, and profile are the nested destinations the sidebar already names.

## Current app inventory (as found)

Confirmed from `createFileRoute` / `createRootRoute` paths and `src/routeTree.gen.ts` (generated; not hand-edited). No `src/routes/api/` folder. No `src/routes/dashboard.tsx`. No `dashboard/activity.tsx`.

| File / folder | Likely URL | Notes |
| --- | --- | --- |
| `src/routes/__root.tsx` | (app root layout) | Document shell (`html`, `head`, `body`, `Outlet`). Do not replace casually. |
| `src/routes/index.tsx` | `/` | Starter home. Links to `/dashboard`. |
| `src/routes/about.tsx` | `/about` | Starter about page. Leave in place. |
| `src/routes/dashboard/route.tsx` | `/dashboard` | **Layout route.** Shared header (“PREIshare” / “Investor Dashboard”) and `<Outlet />` for child content. |
| `src/routes/dashboard/` | (folder) | Layout plus child routes of `/dashboard`. |
| `src/routes/dashboard/index.tsx` | `/dashboard` | **Index page.** Placeholder home copy. Route id `/dashboard/`. Nests under the layout. |
| `src/routes/dashboard/portfolio.tsx` | `/dashboard/portfolio` | Child page. Renders `PortfolioTable`. |
| `src/routes/dashboard/deals.tsx` | `/dashboard/deals` | Child page. Renders `DealsList`. |
| `src/routes/dashboard/profile.tsx` | `/dashboard/profile` | Child page. Renders `ProfileCard`. |

Sidebar labels already match these paths in `src/components/layout/navConfig.ts`: Home, Portfolio, Deals, Profile.

## Planned dashboard route tree

Keep this tree. The layout file is `src/routes/dashboard/route.tsx`. Do not add `src/routes/dashboard.tsx` beside it (two layout files for the same path). Do not add extra investor pages in this step.

```text
/                          → src/routes/index.tsx (existing starter home; not part of the shell)
/about                     → src/routes/about.tsx (existing; leave alone)
/dashboard                 → layout (header + outlet) — src/routes/dashboard/route.tsx
/dashboard                 → index (placeholder home copy; metrics and activity later on this page)
/dashboard/portfolio       → child (portfolio holdings; deeper tools later)
/dashboard/deals           → child (open deals)
/dashboard/profile         → child (investor profile placeholder)
```

`/dashboard/activity` is **not** in this tree. Recent activity is composed on the index. A full activity feed can be a later route if a prompt asks for one.

## File map

These files are the route tree. Edit them in place. Do not add `src/routes/dashboard.tsx` alongside `src/routes/dashboard/route.tsx`.

| URL | Role | File | Wraps / renders |
| --- | --- | --- | --- |
| `/dashboard` | Layout route | `src/routes/dashboard/route.tsx` | Shared header and `<Outlet />` for child content |
| `/dashboard` | Index page | `src/routes/dashboard/index.tsx` | Placeholder home copy. Does not redefine the app shell. |
| `/dashboard/portfolio` | Child page | `src/routes/dashboard/portfolio.tsx` | Portfolio holdings page inside the layout |
| `/dashboard/deals` | Child page | `src/routes/dashboard/deals.tsx` | Open-deals page inside the layout |
| `/dashboard/profile` | Child page | `src/routes/dashboard/profile.tsx` | Profile placeholder inside the layout |

## Layout vs page responsibilities

- **Layout (`src/routes/dashboard/route.tsx`)**: persistent header (“PREIshare” / “Investor Dashboard”) and the main outlet. No metric-card business content.
- **Index (`src/routes/dashboard/index.tsx`)**: short placeholder home copy (a title and one sentence that metrics will appear here). Uses the parent layout.
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

- Visiting `/dashboard` shows the layout header (“Investor Dashboard”) and the index placeholder (“Welcome back”).
- `/dashboard/portfolio`, `/dashboard/deals`, and `/dashboard/profile` render inside the same layout (the shell is not replaced by a blank full page).
- No unrelated existing routes (`/`, `/about`, `__root`) are deleted during dashboard work.
- Empty-state or sample-data copy stays visible so placeholders are not mistaken for live figures (brief sections 4–6).

## Open questions

- The brief allows a nested activity page as an example. This repo keeps activity on the home index and does not define `/dashboard/activity`. Add that path only if a later prompt asks for a full activity feed.
- Deals and profile are not named in the brief’s screen table, but both routes and nav items already exist. This plan keeps them so existing links stay valid.
- The layout file is `src/routes/dashboard/route.tsx`. Do not add a second layout at `src/routes/dashboard.tsx`.
- `__root.tsx` sets the document title to “PREIshare Investor Dashboard” for every page, including `/` and `/about`. Per-route titles are outside this routing plan.
