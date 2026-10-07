# Page header

The title row at the top of an app page: optional eyebrow (breadcrumb or back link), title with an inline badge, a one-line description, and actions that sit right on desktop and wrap under the title on mobile.

```bash
npx shadcn add @damon/page-header
```

Installs `components/ui/page-header.tsx`. No dependencies.

## When to use

- The top of every admin/app page, so titles, spacing and action placement match across the product.
- Record detail pages: `badge={<StatusBadge status={order.status} />}` and `eyebrow={<Link href="/orders">← Orders</Link>}`.
- Section headers inside a page with `as="h2"`.

## When NOT to use

- Marketing pages. Use `@damon/page-hero`.
- Sticky toolbars with filters. Put those in `@damon/filter-bar` below the header.
- More than two or three actions. Move the rest into a `DropdownMenu` ("More").

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | required | |
| `description` | `ReactNode` | | One line: purpose or a count. |
| `actions` | `ReactNode` | | Primary action last (rightmost). |
| `eyebrow` | `ReactNode` | | Breadcrumb, back link or section label above the title. |
| `badge` | `ReactNode` | | Inline after the title. |
| `as` | `"h1" \| "h2" \| "h3"` | `"h1"` | `h1` is `text-2xl`; others `text-lg`. |
| `className`, … | `header` props | | |

## Minimal example

```tsx
import { PageHeader } from "@/components/ui/page-header"

<PageHeader title="Invoices" description="12 unpaid · $8,420.00 outstanding" actions={<Button>New invoice</Button>} />
```

## Real example

```tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { formatNzDate } from "@/lib/nz-date"

<PageHeader
  eyebrow={<Link href="/invoices" className="hover:text-foreground">← Invoices</Link>}
  title={`Invoice ${invoice.number}`}
  badge={<StatusBadge status={invoice.status} variant="pill" />}
  description={`Issued ${formatNzDate(invoice.issuedOn)} to ${invoice.customerName}`}
  actions={
    <>
      <Button variant="outline" asChild><a href={invoice.pdfUrl}>Download PDF</a></Button>
      <Button>Record payment</Button>
    </>
  }
  className="mb-6"
/>
```

## Constraints

- One `h1` per page. Use `as="h2"` for headers of sections inside the page.
- No bottom margin built in; add `className="mb-6"` (or use a parent `space-y-*`) so it composes in any layout.
- Uses `font-heading` for the title, so a theme's heading font applies automatically.
