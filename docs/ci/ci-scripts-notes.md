# CI scripts notes — PREIshare dashboard

## Package manager
- CI uses: npm
- Lockfile present: package-lock.json

## Scripts CI calls (must match package.json and pr-ci.yml)
| CI step    | package.json script | Exact local command        | Purpose                          |
|------------|---------------------|----------------------------|----------------------------------|
| Install    | (npm ci)            | npm ci                     | Clean install from lockfile      |
| Typecheck  | typecheck           | npm run typecheck          | TypeScript without emit          |
| Build      | build               | npm run build              | Production build                 |
| Lint       | lint                | npm run lint               | Style and common bug checks      |
| Test       | test                | npm run test               | Automated unit/simple tests      |

## package.json script entries (only if you added or stabilized any)
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit -p tsconfig.typecheck.json",
    "build": "vite build --config app.config.ts",
    "lint": "eslint .",
    "test": "vitest run"
  }
}
```

`test` is `vitest run` so the CI job exits instead of watching.

## Intentional gaps
- No full browser end-to-end suite in PR CI yet (keep human/manual or later sprint).
- Secrets and production deploys are out of scope for this workflow.

## How to reproduce a CI failure locally
1. git checkout the PR branch
2. npm ci
3. npm run typecheck && npm run build && npm run lint && npm run test
4. Fix until all four pass, then push again
