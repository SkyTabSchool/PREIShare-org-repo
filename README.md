# PREIshare Investor Dashboard Shell

Responsive investor dashboard shell for PREIshare members (Sprint 3): Home, Portfolio, Deals, and Profile, with mock data only.

## Prerequisites

- Node.js LTS (npm included)
- This repo uses npm. Install from `package-lock.json`.

## Cold start

From the project root:

```bash
npm install
npm run dev
```

`npm run dev` starts Vite on port 3000. Open the URL printed in the terminal, then go to `/dashboard`. If 3000 is already in use, use the port Vite prints instead.

## Other scripts

These are the scripts defined in `package.json`:

| Script | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Preview the build | `npm run preview` |
| Typecheck | `npm run typecheck` |
| Regenerate the route tree | `npm run generate-routes` |

There is no `test` or `lint` script in `package.json`.

## Docs

- Sprint 3 handoff (demo script, routes, limitations): [docs/sprint3-handoff.md](docs/sprint3-handoff.md)
- Architecture decisions: [docs/architecture-decisions.md](docs/architecture-decisions.md)
