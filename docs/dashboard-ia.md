# PREIshare Investor Dashboard — Information Architecture

## Purpose
Map of investor-facing pages for the dashboard shell (mock data only).
No auth flows, admin tools, or live API contracts in this sprint.

## Brief summary
Source: `docs/investor-dashboard-brief.md` (Sprint 3 shell).

PREIshare helps investors make intelligent decisions. This sprint is a clean, trustworthy **shell**: responsive layout, nested file-based routes, and reusable placeholders. Members should scan portfolio value, browse open deals, and review a profile without leaving the shell. Content is **mock data** (made-up sample content), labeled so stakeholders know it is not a live portfolio.

**Primary actor:** Investor (member). A future admin may manage deals or users later and is out of scope to build.

**Investor goals:**
1. Open the dashboard and see a home overview (portfolio snapshot + recent activity placeholders).
2. Reach Portfolio, Deals, and Profile without leaving the app shell.
3. Trust the layout: short labels, consistent navigation, readable on phone and desktop.

**Required areas:** dashboard home, portfolio, deals, profile. Routes nest under `/dashboard/...` so a parent layout can wrap every investor page when file-based routes are added later.

## URL map and page purposes

| URL path | Route name | Nav label | Page purpose | Primary content |
|----------|------------|-----------|--------------|-----------------|
| `/dashboard` | Dashboard home | Home | Show portfolio value, a holdings snapshot, and a recent activity list on one screen | Stats cards, portfolio summary placeholder, recent activity list |
| `/dashboard/portfolio` | Portfolio | Portfolio | Show each mock holding in a table so the investor can review the portfolio row by row | Holdings table (mock rows) |
| `/dashboard/deals` | Deals | Deals | Show open and available deals so the investor can browse what is offered | Deals list (mock cards or rows) |
| `/dashboard/profile` | Profile | Profile | Show this member's name and contact placeholders | Profile card (name and contact placeholders) |

Each URL appears once. These four paths are the full page set from the brief: home, portfolio, deals, and profile. No sign-in, admin, payments, search, or other pages.

## Navigation rules
- Shared chrome: left sidebar (desktop) + top header; main content on the right/below.
- Active nav item should match the current URL path.
- Nav labels are one word each: Home, Portfolio, Deals, Profile.
- Nested under `/dashboard` so a parent layout can wrap all investor pages.

## Out of scope for this shell
- Sign-in / sign-up pages
- Live Supabase queries
- Admin or sponsor tools
- Payments or document vaults
- Creating, editing, or closing deals, and saving a real profile
- Search, notifications, and underwriting tools

## Notes for later route files
Parent layout route: `dashboard`  
Child routes: index (home), `portfolio`, `deals`, `profile`

These paths are the only investor pages in this sprint. File-based routing should mirror them (a `dashboard` parent plus those children) when route files are added. Do not add pages listed under Out of scope.
