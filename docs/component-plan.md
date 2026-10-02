# PREIshare Investor Dashboard — Component Inventory

## Scope
Reusable UI pieces for a responsive shell with **mock data only**.
Components present structure and placeholder content; they do not call real APIs, authenticate, or add pages beyond `/dashboard`, `/dashboard/portfolio`, `/dashboard/deals`, and `/dashboard/profile`.

Names below are locked for later agent prompts. Change a name only by updating this file and `docs/dashboard-ia.md` together.

## Layout components (shared chrome)

| Component | Responsibility | Used on | Must NOT do |
|-----------|----------------|---------|-------------|
| `AppShell` | Frame every dashboard page by placing the sidebar, header, and main content slot. | `/dashboard`, `/dashboard/portfolio`, `/dashboard/deals`, `/dashboard/profile` | Render stats, tables, deal lists, or profile fields, and do not fetch data. |
| `Sidebar` | Show the brand and the primary navigation region on larger screens. | All four pages, inside `AppShell` | Own the label and path list, set the page title, or render holdings or deals. |
| `Header` | Show the current page title and a compact identity placeholder in the top bar. | All four pages, inside `AppShell` | Own the nav list or show the member's contact fields. |
| `navConfig` | Store the four nav labels (Home, Portfolio, Deals, Profile) and their unique `/dashboard` paths in one place. | Read by `NavItems` on all four pages | Render markup, stats, or tables. |
| `NavItems` | Render the links from `navConfig` and mark the item whose path matches the current URL. | All four pages, inside `Sidebar` | Invent labels or paths, or render stats or tables. |

## Dashboard home widgets

| Component | Responsibility | Used on | Must NOT do |
|-----------|----------------|---------|-------------|
| `StatsCard` | Show one mock metric as a label, a value, and an optional hint. | `/dashboard` | Fetch data, lay out the page, or show an allocation mix or a holdings list. |
| `PortfolioSummary` | Show a short mock snapshot of how portfolio value is split. | `/dashboard` | Repeat the headline numbers in `StatsCard` or replace the full holdings table. |
| `RecentActivity` | Show a short list of timestamped mock events. | `/dashboard` | List open deals or own global navigation. |

## Page-level shells

| Component | Responsibility | Used on | Must NOT do |
|-----------|----------------|---------|-------------|
| `PortfolioTable` | Show mock holdings as one table row per holding. | `/dashboard/portfolio` | Show live market data or the home allocation snapshot. |
| `DealsList` | Show mock open and available deals as a list or as cards. | `/dashboard/deals` | Act as an activity feed, or start checkout or subscribe flows. |
| `ProfileCard` | Show this member's mock name and contact placeholders. | `/dashboard/profile` | Change a password, authenticate, or replace the header identity placeholder. |

## Composition rules
1. One job per component — if two rows describe the same job, merge or delete one.
2. Layout components wrap pages; page widgets never re-implement the shell.
3. Mock data may be inline constants for this sprint; real Supabase comes later.
4. Names above are locked for later agent prompts — do not rename without updating both docs.

Jobs stay separate:
- `navConfig` stores labels and paths. `NavItems` only renders that list. `Sidebar` is the region. `Header` owns the page title.
- `StatsCard` is one number. `PortfolioSummary` is the allocation mix. `PortfolioTable` is the full holdings list.
- `RecentActivity` is an event feed. `DealsList` is the open and available deals catalog.
- `Header` shows a compact identity placeholder. `ProfileCard` shows name and contact.

## Mapping check (IA ↔ components)
- Home (`/dashboard`) → `StatsCard`, `PortfolioSummary`, `RecentActivity` inside `AppShell`
- Portfolio (`/dashboard/portfolio`) → `PortfolioTable` inside `AppShell`
- Deals (`/dashboard/deals`) → `DealsList` inside `AppShell`
- Profile (`/dashboard/profile`) → `ProfileCard` inside `AppShell`
