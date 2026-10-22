# PREIshare Investor Dashboard — Requirements Brief

**Audience:** beginner builders directing an AI coding agent  
**Sprint deliverable:** investor dashboard **shell** only (layout + placeholder content)  
**Stack:** TanStack Start file-based routing, React components, TypeScript  
**How to use this file:** every implementation prompt should name this brief as scope control. Build in small milestones, check the result against section 6, then refine.

PREIshare needs an investor-facing dashboard shell: a clear home base where investors can eventually see portfolio metrics, recent activity, and navigation into deeper tools. This sprint delivers that shell. It does not deliver live market data or account management.

You will direct an AI coding agent to build the shell. You do not need to type every line yourself. Your job is to clarify what investors need, plan routes and layout regions, write strong prompts, and review what the agent produces against this brief.

Work from the repository root (the folder that contains `package.json`). Start the app with `npm run dev`. Vite serves it at `http://localhost:3000`. Open the dashboard at `http://localhost:3000/dashboard` once that route exists.

## Terms used in this brief


| Term                      | Meaning the first time it matters                                                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Route**                 | A page with its own web address. In this app, `/dashboard` is the dashboard home route.                                                                        |
| **File-based routing**    | The route’s address comes from a file under `src/routes/`. TanStack Start reads those files and builds the page list. Do not hand-edit `src/routeTree.gen.ts`. |
| **Layout**                | The shared frame around pages: header, navigation, and the main content area. Child routes render inside that frame.                                           |
| **Shell**                 | The layout plus placeholder content, before real data is connected. Stakeholders can click through it and see where future tools will live.                    |
| **Component**             | A reusable piece of React UI, such as a metric card or the sidebar. Shared UI lives in `src/components/`.                                                      |
| **Placeholder**           | Sample text or numbers shown so the region is visible. It is not an investor’s real portfolio.                                                                 |
| **Empty state**           | A short message shown when real data is not connected yet, so nobody mistakes the shell for live figures.                                                      |
| **Responsive breakpoint** | A screen width where the layout changes. Desktop can show a sidebar. A narrow (mobile) width needs a collapsible navigation pattern so the page stays usable.  |




## 1. Product context

PREIshare is a real-estate intelligence product: it helps investors make intelligent decisions. Investors need a home base where they can eventually see portfolio metrics, recent activity, and links into deeper tools.

This sprint delivers the **shell only**: layout regions and placeholder content. Live market data, account management, and deeper investment tools come later.

## 2. Primary actor and goals

- **Actor:** Investor — a signed-in user viewing their private dashboard. Sign-in itself is out of scope this sprint (see section 5). Treat the person opening `/dashboard` as that investor.
- **Goals on first visit:**
  1. Recognize they are in the PREIshare investor area (branding / header).
  2. Navigate among dashboard sections without getting lost.
  3. See high-level portfolio metrics at a glance.
  4. Scan recent activity related to their investments.



## 3. Primary screens (this sprint)


| Screen                                                  | Purpose                                 | In this sprint? |
| ------------------------------------------------------- | --------------------------------------- | --------------- |
| Dashboard home                                          | Shell + metrics + activity placeholders | Yes             |
| Nested dashboard sections (placeholders / empty states) | Prove routing and navigation work       | Yes (minimal)   |
| Login / signup                                          | Authentication                          | No (later)      |
| Live portfolio detail / trades                          | Deep investment tools                   | No (later)      |


A **nested dashboard section** is a child route under `/dashboard` (for example a later portfolio or activity page). This sprint only needs enough nested pages to show that navigation changes the main content while the shell stays in place. Each nested page can be a short empty state.

## 4. Dashboard layout regions

Describe these regions in UI work. The shell composes them; page-specific content renders in the main area.

1. **Header** — product name/logo area, plus a simple user/account placeholder.
2. **Navigation** — a sidebar on desktop; a collapsible navigation pattern on small screens (below a mobile breakpoint).
3. **Metrics region** — cards for summary numbers. Placeholders are enough.
4. **Activity region** — a list of recent items. Placeholders are enough.
5. **Main content area** — where the current route’s content renders inside the shell.

Navigation labels must be words an investor understands (for example Home, and the names of the nested sections you add). Avoid internal engineering names in the UI.

## 5. Must-have vs later



### Must-have (demoable shell)

- File-based dashboard route(s) under a `/dashboard` area (`src/routes/`).
- An app shell that composes header + navigation + main content.
- Responsive behavior: usable on mobile, tablet, and desktop widths. At a narrow width, navigation remains usable (a collapsible or mobile nav pattern). At a desktop width, header, navigation, metrics, and activity are all visible.
- Placeholder metric cards and a recent-activity list on the dashboard home page.
- Empty-state messaging when real data is not connected yet.
- Clear navigation labels an investor would understand.



### Later (explicitly out of scope now)

- Real Supabase queries, balances, or pgvector search.
- Authentication, roles, and permissions UI.
- Payments, documents vault, tax exports.
- A polished design system beyond a clean functional layout.
- Charts that require live time-series data.

If an agent adds a feature from the “later” list, reject that output and ask for a shell that stays inside this brief.

## 6. Success criteria

The shell is done when every box below is true.

- [ ] An investor can open the dashboard home route in the browser (`http://localhost:3000/dashboard` while `npm run dev` is running from the repository root).
- [ ] Header, navigation, metrics, and activity regions are all visible on desktop.
- [ ] On a narrow (mobile) width, navigation remains usable (a mobile nav pattern, not a sidebar that covers or breaks the page).
- [ ] Placeholder content is clearly labeled so stakeholders know data is not live.
- [ ] What was built matches this brief (no surprise mega-features).
- [ ] A teammate can read this brief and understand scope in under 5 minutes.



## 7. Notes for an AI-assisted build

Work in this order. Each step should be one prompt, then a check, then the next prompt.

1. **Routes** — add the `/dashboard` home route and minimal nested section routes.
2. **Shell** — compose header, navigation, and main content as the shared layout.
3. **Nav** — label links an investor understands and show which section is current.
4. **Widgets** — add placeholder metric cards and a recent-activity list on the home page, with empty-state copy.
5. **Compose** — put the widgets inside the shell so home and nested pages share the same frame.
6. **Responsive QA** — check a narrow mobile width, a tablet width, and a desktop width. Confirm navigation still works and content does not force horizontal scrolling.

Prompt rules:

- Point the agent at this file (`docs/preishare-dashboard-requirements.md`) as scope control.
- Ask for TypeScript, TanStack Start file-based routes, and React components that match existing files under `src/routes/` and `src/components/`.
- Ask for placeholders and empty states only. Do not ask for live data, auth, or payments.
- After each milestone, compare the result to section 6. Refine only what failed the check.
- Reject agent output that adds out-of-scope fintech features without asking.

