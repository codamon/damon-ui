# CTA band

A closing call-to-action section: big heading, a primary and an optional secondary action, and small print. Three tones (dark inverse, brand gradient, muted) and an optional background image with a readability scrim.

```bash
npx shadcn add @damon/cta-band
```

Installs `components/cta-band.tsx`. Adds `surface-*`, `brand*`, `brand-gradient` and `text-display` tokens if missing (`@damon/theme-marketing` defines them).

## When to use

- The last section before the footer on service and landing pages: "Ready to start? Book a free measure."
- Mid-page prompts between content sections (`tone="muted"`).
- Contact prompts that offer a phone number next to the form link.

## When NOT to use

- The page's opening section. Use `@damon/page-hero`.
- Inline links inside copy, or banners that need dismissing. Use `@damon/notice`.
- Several CTA bands stacked on one page. Pick the one action that matters.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | required | `h2`, labels the section. |
| `description` | `ReactNode` | | One or two sentences. |
| `primaryAction` | `ReactNode` | | Usually `<Button size="lg" asChild><Link/></Button>`. |
| `secondaryAction` | `ReactNode` | | E.g. a `tel:` link. |
| `note` | `ReactNode` | | Small print: response time, "no obligation". |
| `tone` | `"inverse" \| "brand" \| "muted"` | `"inverse"` | Dark band / brand gradient / quiet `surface-2`. |
| `background` | `ReactNode` | | Image layer (e.g. `next/image` with `fill`); a gradient scrim is added. |
| `align` | `"start" \| "center"` | `"start"` | |
| `headingId` | `string` | generated | |

## Minimal example

```tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CtaBand } from "@/components/cta-band"

<CtaBand
  title="Ready when you are"
  primaryAction={<Button size="lg" asChild><Link href="/contact">Get a quote</Link></Button>}
/>
```

## Real example

```tsx
import Image from "next/image"
import Link from "next/link"
import { PhoneIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CtaBand } from "@/components/cta-band"

<CtaBand
  title="Talk to a joiner, not a call centre"
  description="Tell us about the room. We'll come and measure, free, anywhere in Auckland."
  primaryAction={
    <Button size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90" asChild>
      <Link href="/contact">Book a measure</Link>
    </Button>
  }
  secondaryAction={
    <Button size="lg" variant="outline" className="border-current bg-transparent text-inherit hover:bg-surface-inverse-foreground/10" asChild>
      <a href="tel:+6491234567"><PhoneIcon /> 09 123 4567</a>
    </Button>
  }
  note="We reply within one working day. No obligation."
  background={<Image src="/workshop.jpg" alt="" fill sizes="100vw" className="object-cover" />}
/>
```

## Constraints

- On `inverse` and `brand` tones, style buttons for a dark surface (see the real example). Default shadcn `outline` buttons assume a light background.
- Background images are decorative: pass `alt=""`. The scrim uses `surface-inverse`, so text contrast holds in both modes.
- `brand` tone puts `brand-foreground` text on `brand-gradient`; check contrast if you change the brand colours.
- Server component (no client JS).
