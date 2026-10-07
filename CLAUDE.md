# damon-ui

Damon's personal open-source component library, distributed as a **shadcn registry** (not an npm package).
Consumers run `npx shadcn add @damon/<item>` and the source is copied into their project.
The primary consumer is an AI coding agent, so per-component docs matter as much as the code.

- Plan and architecture: `docs/PLAN.md`
- Machine-specific setup (paths, dev host, credentials, private source map) lives in `CLAUDE.local.md`
  and `docs/private/`. Both are gitignored; never commit their contents.

## Fixed facts

- Dev port: **3350**, listening on `0.0.0.0` (`pnpm dev`).
- Allowed dev origins come from `ALLOWED_DEV_ORIGINS` (comma-separated) in `.env.local`; Playwright reads
  `PLAYWRIGHT_BASE_URL` from the same file. Defaults: none / `http://localhost:3350`.
- Hosting: Cloudflare Pages, project `damon-ui`, URL `https://damon-ui.pages.dev`. Deployed by direct upload of `out/`.
- Stack: Next.js 16 (static export) + React 19 + Tailwind v4 + shadcn CLI (`shadcn build`). TypeScript strict
  at an ES2017 target (the default for Next apps, so shipped code must typecheck there). pnpm.
- License: MIT.

## Rules

1. **Port, don't copy.** Sources are in other projects with different styling (CSS Modules, plain CSS, TW v3).
   Rewrite into Tailwind v4 + shadcn conventions (`cn()`, `cva`, `data-slot`, CSS-variable tokens).
   Strip business names, domain types, CMS coupling, and any URLs/emails/keys. Don't name source projects in
   committed code, comments or docs.
2. **Build on shadcn primitives.** If shadcn already ships it (button, dialog, input, field, empty…), declare it in
   `registryDependencies` instead of re-implementing, and don't reuse its file name.
3. **Never modify source projects.** Read only.
4. Every registry item ships with:
   - the code, a demo page at `/docs/<name>`,
   - `content/docs/<name>.md` with: when to use / when NOT to use / props / minimal example / real example / constraints,
   - tests: Vitest for `lib/` (pure functions must have unit tests), Playwright screenshot for UI items.
5. Tokens live in one place (`registry/damon/theme/tokens.ts`). Components use semantic tokens only — no raw hex/px.
   `scripts/check-raw-colours.ts` fails the build on raw colour/px literals in `registry/**` components.
6. `public/llms.txt`, `public/llms-full.txt` and `public/docs/*.md` are generated from `content/docs/`. Never hand-edit.
7. Done = `pnpm typecheck && pnpm test && pnpm registry:build && pnpm build` all pass, and the item installs into a
   scratch Next app via `npx shadcn add <dev-or-prod-url>/r/<name>.json`. Report evidence, not claims.

## Outward-facing actions — confirm with the user first

Changing repo visibility, deploying to Cloudflare Pages, binding a custom domain.
