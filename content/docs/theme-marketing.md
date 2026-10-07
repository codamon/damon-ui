# Theme: marketing

A complete token preset for marketing sites: ink-on-white, blue/violet brand pair, layered surfaces, a brand gradient and fluid display type. Light and dark.

```bash
npx shadcn add @damon/theme-marketing
```

Writes CSS variables into your `globals.css` (`:root`, `.dark` and `@theme inline`). No component files.

## When to use

- Landing pages, service sites and blogs built with shadcn, where you want a branded look rather than shadcn's neutral grey.
- Before adding `@damon/page-hero` or `@damon/cta-band`. They use `surface-*`, `brand` and `text-display` / `text-hero`, which this preset defines.
- As a starting point: change `--brand` and `--brand-2` and everything derived from them follows.

## When NOT to use

- Admin panels, dashboards and back-office tools. Use `@damon/theme-admin`, which is denser and quieter.
- Projects that already have a design system. Add only the tokens you are missing; don't overwrite their palette.
- Non-shadcn projects. The variable names follow shadcn's conventions.

## API

Tokens added on top of shadcn's standard set (`background`, `primary`, `muted`, `border`…):

| Token | Tailwind utility | Use |
|---|---|---|
| `--brand`, `--brand-foreground` | `bg-brand`, `text-brand-foreground` | Brand highlight fills, CTA buttons on dark bands |
| `--brand-2` | `bg-brand-2` | Second brand colour, gradient end |
| `--brand-gradient` | `bg-(image:--brand-gradient)` | `linear-gradient(135deg, brand, brand-2)` |
| `--surface-1`, `--surface-2` | `bg-surface-1`, `bg-surface-2` | Alternating section backgrounds |
| `--surface-inverse`, `--surface-inverse-foreground` | `bg-surface-inverse`, `text-surface-inverse-foreground` | Dark band on a light page (flips in dark mode) |
| `--success`, `--warning`, `--info` (+ `-foreground`) | `text-success`, `bg-warning/10`, `bg-info text-info-foreground` | Status tones |
| `text-display` | `text-display` | `clamp(2rem, 4.5vw, 3.5rem)` section titles |
| `text-hero` | `text-hero` | `clamp(2.5rem, 7vw, 6rem)` the single page headline |

Values: `--radius: 0.75rem`. Primary is the brand blue (`#4363d9`), foreground is ink (`#0e1a33`). Dark mode is deep navy (`#0b1020`).

## Minimal example

```bash
npx shadcn add @damon/theme-marketing
```

```tsx
<section className="bg-surface-1 py-20">
  <h2 className="text-display font-semibold tracking-tight">Built for tradies</h2>
</section>
```

## Real example

Rebrand by overriding two anchors in `globals.css`, after the generated block:

```css
:root {
  --brand: #0b6b4f;      /* pounamu */
  --brand-2: #1d4ed8;
  --primary: var(--brand);
  --ring: var(--brand);
}
.dark {
  --brand: #4fcfa1;
  --brand-foreground: #06231a;
  --primary: var(--brand);
  --primary-foreground: var(--brand-foreground);
}
```

```tsx
<section className="rounded-2xl bg-surface-inverse p-10 text-surface-inverse-foreground">
  <h2 className="font-heading text-display font-semibold">Ready when you are</h2>
  <Button className="mt-6 bg-brand text-brand-foreground hover:bg-brand/90">Get a quote</Button>
</section>
```

## Constraints

- Every text pairing passes WCAG AA (4.5:1) in light and dark. `tests/lib/tokens.test.ts` enforces it; re-check contrast if you change colours.
- `accent` keeps shadcn's meaning (subtle hover surface). Brand colour is `primary` / `brand`, never `accent`.
- Status tones are text-strength. Use `bg-success/10 text-success` for a tint, `bg-success text-success-foreground` for a solid fill.
- Fonts are not part of the preset. Load a display face with `next/font` and point `--font-heading` at it.
- Installing a theme overwrites the same variables already in `globals.css`. Commit before you run it.
