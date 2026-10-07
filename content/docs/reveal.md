# Reveal

Fade-and-rise when an element first scrolls into view. It fires once, respects reduced motion, and never leaves content invisible when JavaScript is off, so the layout needs no `<noscript>` override.

```bash
npx shadcn add @damon/reveal
```

Installs `components/ui/reveal.tsx`. No dependencies.

## When to use

- Sections and cards on marketing pages that should ease in as the visitor scrolls.
- Staggered grids or lists: `delay={i * 80}` on each item.
- Anywhere a scroll animation is wanted but the content must stay crawlable and visible without JS.

## When NOT to use

- Above-the-fold content. It should be visible at first paint; use the built-in rise of `@damon/page-hero` instead.
- App UI, tables and forms. Motion there slows people down.
- Scroll-linked effects (parallax, progress, pinning). That's GSAP / scroll-driven animation territory.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `as` | `"div" \| "li" \| "section" \| "article" \| "span"` | `"div"` | Use `li` inside lists. |
| `delay` | `number` | `0` | Stagger in ms (`transition-delay`). |
| `threshold` | `number` | `0.12` | Visible fraction that triggers. |
| `rootMargin` | `string` | `"0px 0px -8% 0px"` | IntersectionObserver root margin; reveals slightly after entering. |
| `className`, `style`, … | HTML attributes | | Passed through. |

State is exposed as `data-state="hidden" \| "shown"` for your own styling.

## Minimal example

```tsx
import { Reveal } from "@/components/ui/reveal"

<Reveal>
  <h2 className="text-display font-semibold">Why people choose us</h2>
</Reveal>
```

## Real example

Staggered service cards in a real list:

```tsx
import { Reveal } from "@/components/ui/reveal"

<ul className="grid gap-6 md:grid-cols-3">
  {services.map((s, i) => (
    <Reveal as="li" key={s.slug} delay={i * 90} className="rounded-xl border bg-card p-6">
      <h3 className="font-semibold">{s.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{s.summary}</p>
    </Reveal>
  ))}
</ul>
```

## Constraints

- The hidden start state is behind `motion-safe:` and `@media (scripting: enabled)`. Browsers without JS, users with reduced motion, and browsers too old for the `scripting` media query all get the content without animation.
- Client component. Each instance creates one IntersectionObserver and disconnects it after the first reveal.
- If `IntersectionObserver` is missing, content shows immediately.
- Don't wrap the only copy of a page's H1 or primary CTA: it starts transparent until hydration.
