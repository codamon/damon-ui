# Page hero

The opening section of a marketing page: eyebrow, a big fluid title, intro, actions and optional media, with a short staggered rise-in. Sized by the `text-hero` / `text-display` tokens and coloured by the `surface-*` tokens.

```bash
npx shadcn add @damon/page-hero
```

Installs `components/page-hero.tsx`. Adds the `surface-*`, `brand*` and `text-hero` / `text-display` tokens to `globals.css` if missing (`@damon/theme-marketing` defines them all). Uses `tw-animate-css`, which shadcn projects already import.

## When to use

- The top of service, about, pricing and landing pages.
- With a photo, illustration or a short form beside the copy (`media`).
- On a dark section (`tone="inverse"`) when the header sits over it.

## When NOT to use

- App pages. Use `@damon/page-header`.
- Carousels or video heroes. Build those deliberately; this block stays simple.
- More than one per page. It renders the page's `h1`.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | required | Rendered as the `h1`; labels the section. |
| `intro` | `ReactNode` | | Two or three lines. |
| `eyebrow` | `ReactNode` | | Small uppercase label. |
| `actions` | `ReactNode` | | Buttons/links. |
| `media` | `ReactNode` | | Beside the copy on `lg`, below on mobile. |
| `size` | `"hero" \| "display"` | `"hero"` | `hero` for 2–3 words; `display` for a sentence. |
| `align` | `"start" \| "center"` | `"start"` | Ignored when `media` is set. |
| `tone` | `"surface" \| "background" \| "inverse"` | `"surface"` | `bg-surface-1`, `bg-background`, or dark `bg-surface-inverse`. |
| `headingId` | `string` | generated | |
| `className`, … | `section` props | | Add top padding if a fixed header overlaps (`pt-40`). |

## Minimal example

```tsx
import { PageHero } from "@/components/page-hero"

<PageHero title="Built to last" intro="Kitchens, wardrobes and stairs made in Auckland from native timber." />
```

## Real example

```tsx
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHero } from "@/components/page-hero"

<PageHero
  eyebrow="Kitchens"
  size="display"
  title="A kitchen made for the way you cook"
  intro="We design, build and install in one team, so the person who measures is the person who fits."
  actions={
    <>
      <Button size="lg" asChild><Link href="/contact">Book a free measure</Link></Button>
      <Button size="lg" variant="outline" asChild><Link href="/work">See our work</Link></Button>
    </>
  }
  media={
    <Image src="/kitchens/hero.jpg" alt="Rimu kitchen with brass handles" width={960} height={720} priority className="rounded-2xl" />
  }
  className="pt-32"
/>
```

## Constraints

- One per page: it owns the `h1`, and the section is `aria-labelledby` it.
- The rise-in runs on load (not on scroll), under `motion-safe:` only. Content is visible without JS.
- Title size comes from tokens: `text-hero` = `clamp(2.5rem, 7vw, 6rem)`, `text-display` = `clamp(2rem, 4.5vw, 3.5rem)`. Change them in the theme, not per page.
- Server component (no client JS).
