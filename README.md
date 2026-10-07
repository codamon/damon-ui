# damon-ui

A [shadcn registry](https://ui.shadcn.com/docs/registry) of components and helpers proven in real projects.
Source is copied into your app; there is no npm package.

```json
// components.json
{ "registries": { "@damon": "https://damon-ui.pages.dev/r/{name}.json" } }
```

```bash
npx shadcn add @damon/nz-money
```

Docs: one markdown file per item in `content/docs/`, published at `/docs/<name>` and `/docs/<name>.md`.
AI agents should start at `/llms.txt`.

## Develop

```bash
pnpm install
pnpm dev          # http://0.0.0.0:3350, builds public/r first
pnpm check        # raw-colour check, typecheck, unit tests, registry build, static build
pnpm test:e2e     # Playwright smoke + screenshots
```

See `CLAUDE.md` for rules and `docs/PLAN.md` for the roadmap. MIT licensed.
