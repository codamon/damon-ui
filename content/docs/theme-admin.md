# Theme: admin

A token preset for admin panels and SaaS back offices: warm linen canvas, paper cards, an ink primary button, terracotta reserved for brand and focus, and a dense radius. Light and dark.

```bash
npx shadcn add @damon/theme-admin
```

Writes CSS variables into your `globals.css` (`:root`, `.dark` and `@theme inline`), including the `sidebar-*` set used by shadcn's Sidebar. No component files.

## When to use

- Internal tools, dashboards, CMS and ops consoles: screens where people scan records and act quickly.
- With `@damon/data-table`, `@damon/status-badge`, `@damon/notice` and shadcn's Sidebar. All of them read these tokens.
- When you want structure from surfaces and borders rather than colour: canvas, then card, then rule lines, then accent.

## When NOT to use

- Public marketing pages. Use `@damon/theme-marketing`.
- When the product already has a brand palette for its app UI. Copy just the status tokens instead.

## API

Notable values (light / dark):

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `#f2f0e9` linen | `#171916` | App canvas |
| `--card` | `#fffef9` paper | `#1f221e` | Working surfaces, tables, forms |
| `--primary` | `#262923` ink | `#ecebe4` | Primary button: ink, not colour |
| `--brand` | `#b6472a` terracotta | `#e0896f` | Selected state, priority markers, `bg-brand` badges |
| `--ring` | `#9e3d25` | `#e0896f` | Focus ring |
| `--border` / `--input` | `#d8d5ca` / `#b9b6ab` | `#343832` / `#4a4e46` | Rule lines / control borders |
| `--success` `--warning` `--info` | `#356646` `#7d5214` `#2f6273` | `#8cc79f` `#e2b866` `#8cc0d0` | Status tones, tuned for the warm canvas |
| `--sidebar*` | `#e9e7df` | `#1b1d1a` | shadcn Sidebar |
| `--radius` | `0.5rem` | | Dense controls |

The preset also defines `--surface-1`, `--surface-2`, `--surface-inverse` and `--brand-2`, so marketing blocks still render inside the admin.

## Minimal example

```bash
npx shadcn add @damon/theme-admin
```

```tsx
<div className="rounded-lg border bg-card p-4">
  <h2 className="text-sm font-semibold">Orders</h2>
  <p className="text-sm text-muted-foreground">12 waiting for proof approval</p>
</div>
```

## Real example

Admin page: canvas, header, one card per region, status read from tokens.

```tsx
<main className="mx-auto max-w-6xl space-y-4 p-4">
  <PageHeader title="Orders" description="Production queue" actions={<Button>New order</Button>} />
  <section className="rounded-lg border bg-card">
    <DataTable columns={columns} rows={orders} />
  </section>
  <p className="text-sm">
    <span className="rounded-full bg-success/10 px-2 py-0.5 text-success">Shipped</span>
  </p>
</main>
```

Use the system font stack the original design used, in `app/layout.tsx` or `globals.css`:

```css
@theme inline {
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```

## Constraints

- Every text pairing passes WCAG AA (4.5:1) in light and dark (`tests/lib/tokens.test.ts`).
- Terracotta is for emphasis only. Don't use it for large fills, and don't use it to make up for weak grouping.
- Primary buttons are ink. A coloured primary reads as marketing in an admin.
- Fonts and base font size are not part of the preset. The source design used 13px body text and system UI fonts.
- Installing a theme overwrites the same variables already in `globals.css`. Commit before you run it.
