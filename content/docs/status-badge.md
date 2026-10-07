# Status badge

Show a status value as a coloured dot plus a readable label (`● Pending review`), or as a tinted pill. A default status→tone map covers common values like paid, overdue and draft.

```bash
npx shadcn add @damon/status-badge
```

Installs `components/ui/status-badge.tsx` and adds `--success`, `--warning`, `--info` tokens to `globals.css` if they are missing (existing values are kept).

## When to use

- Status columns in tables: invoices, orders, jobs, deployments, bookings.
- Next to a page title (`<PageHeader badge={<StatusBadge status={order.status} />} />`).
- When the raw value comes from the database (`"pending_review"`) and you want a consistent label and colour everywhere.

## When NOT to use

- Counts or tags that aren't states (categories, labels). Use shadcn `Badge`.
- Messages that need explaining. Use `@damon/notice`.
- Live progress (uploading 40%). Use a progress bar.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `status` | `string` | required | Raw value. Normalised (`"Pending Review"` → `pending_review`) for lookup and `data-status`. |
| `label` | `ReactNode` | `humanizeStatus(status)` | Pass the translated label here. |
| `tone` | `"neutral" \| "success" \| "warning" \| "danger" \| "info"` | looked up | Forces a tone. |
| `tones` | `Record<string, StatusTone>` | | Adds to or overrides `DEFAULT_STATUS_TONES` for this badge. |
| `variant` | `"dot" \| "pill"` | `"dot"` | `dot` stays quiet in dense tables; `pill` stands out on cards. |

Helpers, also exported: `statusTone(status, tones?)`, `humanizeStatus(status)`, `normalizeStatus(status)`, `DEFAULT_STATUS_TONES`.

Default tones: **success** paid, active, approved, completed-like states (done, shipped, delivered, published, verified…); **warning** pending, unpaid, in_review, on_hold, partially_paid; **danger** failed, overdue, error, blocked, declined; **info** sent, open, processing, running, scheduled, submitted, completed, filed; **neutral** draft, archived, cancelled, expired, rejected, unknown, and anything not listed.

## Minimal example

```tsx
import { StatusBadge } from "@/components/ui/status-badge"

<StatusBadge status={invoice.status} />
```

## Real example

Domain-specific tones and translated labels, defined once:

```tsx
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge"
import { useTranslations } from "next-intl"

const ORDER_TONES: Record<string, StatusTone> = {
  awaiting_proof: "warning",
  printing: "info",
  ready_for_pickup: "success",
}

export function OrderStatus({ status }: { status: string }) {
  const t = useTranslations("orderStatus")
  return <StatusBadge status={status} tones={ORDER_TONES} label={t.has(status) ? t(status) : undefined} />
}
```

## Constraints

- Colour is never the only signal; the label is always rendered. Don't render a dot without text.
- Label case comes from the data or translation. `humanizeStatus` only upper-cases the first letter, because CSS `capitalize` turns "Sin pagar" into "Sin Pagar".
- Unknown statuses render neutral rather than throwing.
- Tones read `--success`, `--warning`, `--info` and shadcn's `--destructive`. Theme presets override them.
