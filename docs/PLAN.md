# damon-ui plan

## Goal

Stop re-writing the same UI in every project. Make it trivial for an AI agent to discover and reuse
Damon's proven components: one command to install, one doc to read, one skill telling the agent it exists.

## Architecture

```
damon-ui/
├─ registry.json                 # shadcn registry manifest (all items)
├─ registry/damon/
│  ├─ theme/                     # tokens: marketing + admin presets (registry:theme / registry:style)
│  ├─ lib/                       # pure TS: nz-money, nz-date, gst, seo, json-ld …  (registry:lib)
│  ├─ hooks/                     # use-is-mobile, use-api …                          (registry:hook)
│  ├─ ui/                        # field, status-badge, notice, data-table …         (registry:ui)
│  └─ blocks/                    # app-shell, page-hero, cta-band, contact-form …    (registry:block)
├─ content/docs/<name>.md        # AI-facing docs, one per item
├─ app/                          # docs site (Next static export) — demo page per item
├─ public/r/*.json               # output of `shadcn build` (gitignored, built in CI)
├─ public/llms.txt               # generated index
├─ skills/damon-ui/SKILL.md      # Claude skill: "check damon-ui before writing UI"
└─ scripts/                      # gen-llms, check-raw-colours, etc.
```

Consumers add to their `components.json`:

```json
{ "registries": { "@damon": "https://damon-ui.pages.dev/r/{name}.json" } }
```

then `npx shadcn add @damon/field`. The shadcn MCP server can browse `@damon` too.

## Decisions

| Topic | Decision | Why |
|---|---|---|
| Distribution | shadcn registry, source copied | AI can edit installed code; no version lock-in |
| Styling | Tailwind v4 + CSS variables, shadcn conventions | 3 projects already on it; others get ported |
| Primitives | Reuse shadcn's own items via `registryDependencies` | Don't maintain a second Dialog/Button |
| Tokens | Semantic surface layer from a production marketing site + warm admin preset from a production admin panel | Most complete existing systems |
| Docs | Markdown per item → llms.txt | Agents read md, not Storybook |
| Tests | Vitest (lib), Playwright screenshots (ui/blocks) | Cheap, catches regressions |
| Hosting | Cloudflare Pages static | Free, personal account already used |
| Non-React projects (Svelte/Vue/Laravel) | Only the tokens CSS is usable there | Don't build framework ports |

## Phases

### Phase 0 — skeleton (first session)
- `create-next-app` (TS, Tailwind v4, App Router, pnpm), `shadcn init`, static export, port 3350.
- `registry.json`, `shadcn build` script, `/r/*.json` served.
- Docs site layout: sidebar listing items from registry.json, `/docs/[name]` renders md + demo.
- `gen-llms` script, raw-colour check script, Vitest + Playwright wired.
- One trivial item end-to-end (e.g. `nz-money`) installed into a scratch consumer app → proves the pipeline.

### Phase 1 — first batch (~15 items)
1. `theme-marketing`, `theme-admin` (tokens)
2. `nz-money`, `nz-date`, `gst` (lib, fully unit-tested)
3. `field`, `status-badge`, `notice`, `page-header`, `resource-state` (empty/loading/error), `confirm-dialog`
4. `data-table` (+ `filter-bar`, `pager`)
5. `reveal`, `cta-band`, `page-hero`, `json-ld`, `seo` (metadata helper)

### Phase 2 — AI integration
- `skills/damon-ui/SKILL.md` + install instructions to `~/.claude/skills/damon-ui`.
- Verify: in a fresh project, ask Claude to "add a form with validation" and confirm it reaches for `@damon/field`.
- Cloudflare Pages deploy (confirm with user first), GitHub repo (confirm first).

### Phase 3 — second batch
app-shell, action-form, combobox, money-input, date-input, file-dropzone, unsaved-changes-bar,
mobile-nav/site-header, contact-form (server action), sitemap/og-image helpers, locale-switcher + i18n-lite,
logo-marquee, count-up, kpi-card, cookie-consent + analytics (new), faq (new).

### Later / only on demand
Domain-specific items (slot-grid, checkout, ad-slot), Tiptap editor bundle, GSAP motion tier, effect cards.

## Inclusion rule

An item goes in only if it has been written in **≥2 real projects** or is clearly generic and proven in one.
No speculative components.
