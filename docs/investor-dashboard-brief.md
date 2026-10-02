# PREIshare Investor Dashboard — Client Brief (Sprint 3 Shell)

## Product summary

PREIshare is a real-estate intelligence product that helps investors make intelligent decisions. PREIshare needs a clean, trustworthy investor dashboard shell where members can scan portfolio value, browse open deals, and review their profile without hunting through cluttered pages. This sprint delivers the **shell only**: responsive layout, file-based routes, and reusable UI placeholders—not live backend data or authentication.

A **file-based route** is a page whose web address comes from a file in the app (TanStack Start). A **placeholder** is visible sample content so a stakeholder can see the area before real holdings or deals are connected.

## Primary actors

| Actor | Role in this sprint | In scope to build? |
|-------|---------------------|--------------------|
| Investor (member) | Uses the dashboard to scan portfolio value, open deals, and view profile | Yes — primary user |
| Future admin | May manage deals or users later | No — mention only as a future actor |

## Investor goals

1. Open the dashboard and immediately see a home overview (portfolio snapshot + recent activity placeholders).
2. Navigate to Portfolio, Deals, and Profile without leaving the app shell.
3. Trust the layout: clear labels, consistent navigation, readable on phone and desktop.

## Must-have dashboard areas (this sprint)

| Area | Route idea (for later steps) | What the investor should see |
|------|------------------------------|------------------------------|
| Home overview | `/dashboard` | Stats cards, portfolio summary placeholder, recent activity list placeholder |
| Portfolio | `/dashboard/portfolio` | Table or list shell for holdings (mock data OK) |
| Deals | `/dashboard/deals` | List shell of open/available deals (mock data OK) |
| Profile | `/dashboard/profile` | Profile card shell (name, contact placeholders) |

**Mock data** is made-up sample content for the demo. It is not an investor’s real portfolio, deals, or contact details.

## Success criteria (demo-ready shell)

- [ ] Investor can reach Home, Portfolio, Deals, and Profile from persistent navigation.
- [ ] Each area has its own route/page shell with a clear page title.
- [ ] Layout includes sidebar (or equivalent nav), header, and main content region.
- [ ] On a narrow screen, content remains usable (nav collapses or stacks; no broken overlap).
- [ ] Placeholder/mock content is labeled as mock so stakeholders know data is not live.
- [ ] Brief, information architecture, and UI stay aligned: no surprise pages outside the four areas above.

## Out of scope (explicit non-goals for this sprint)

- Real sign-in / authentication and authorization
- Live Supabase/PostgreSQL portfolio or deals data
- Payments, subscriptions, or document e-sign
- Admin CRUD tools for managing investors or deals
- Production deployment hardening and CI beyond basic project setup
- Creating, editing, or closing deals, and saving a real profile
- Search, notifications, and underwriting tools

## Prompting notes for later AI steps

When directing a coding-agent or ide-copilot, always attach or quote this brief and require: TypeScript + TanStack Start file-based routes, reusable React components, mock data only, and no auth. Tell the tool this work is for beginners and must stay specific to PREIshare, not generic SaaS filler. Reject output that adds pages or features listed under Out of scope.

## Open questions / assumptions

- Assume English UI copy for the shell.
- Assume a single investor persona viewing their own data (no multi-portfolio switcher yet).
- Visual brand can be simple and professional; a full brand system is not required this sprint.
