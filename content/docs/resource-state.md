# Resource state

Empty, error and loading states for lists, tables and pages: `EmptyState`, `ErrorState` (retry and reference id), and `LoadingState` (skeletons shaped like a table, card grid or list). Built on shadcn's `Empty` and `Skeleton`.

```bash
npx shadcn add @damon/resource-state
```

Installs `components/ui/resource-state.tsx` and shadcn's `empty`, `skeleton`, `button` if missing. Exports `EmptyState`, `ErrorState`, `LoadingState`, `ResourceState`.

## When to use

- A list or table with no rows yet (`EmptyState` with the "create first" action), or no rows for the current filters (offer "Clear filters").
- A fetch that failed (`ErrorState` with `onRetry` and the request id).
- `loading.tsx` files and Suspense fallbacks (`LoadingState variant="table"`), so the page shape shows straight away.
- Permission or "not set up yet" pages: `ResourceState` with your own icon.

## When NOT to use

- Inline messages next to content that did load. Use `@damon/notice`.
- Loading a single button or field. Use a spinner in the button.
- A full-screen 404/500. Use Next's `not-found.tsx` / `error.tsx` (they can render `ErrorState` inside).

## Props

`EmptyState` / `ResourceState`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | required | What's missing: "No invoices yet". |
| `description` | `ReactNode` | | What will appear here and how. |
| `action` | `ReactNode` | | The next step (buttons/links). |
| `detail` | `ReactNode` | | Small print under the actions. |
| `icon` | `ReactNode \| null` | inbox (Empty) / none | |

`ErrorState` — all of the above plus:

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | `"This couldn't be loaded"` | |
| `onRetry` | `() => void` | | Renders a "Try again" button (ignored if `action` set). |
| `retryLabel` | `string` | `"Try again"` | |
| `reference` | `string` | | Request/error id shown in monospace for support. |

Renders with `role="alert"`.

`LoadingState`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `"table" \| "cards" \| "list"` | `"table"` | Match the content that's coming. |
| `rows` | `number` | `5` | |
| `label` | `string` | `"Loading"` | Screen-reader text (`role="status"`, `aria-busy`). |

## Minimal example

```tsx
import { EmptyState } from "@/components/ui/resource-state"

{invoices.length === 0 ? (
  <EmptyState title="No invoices yet" description="Invoices you create will show up here." action={<Button>New invoice</Button>} />
) : (
  <InvoiceTable rows={invoices} />
)}
```

## Real example

`app/invoices/loading.tsx`, `error.tsx` and the filtered-empty case:

```tsx
// loading.tsx
import { LoadingState } from "@/components/ui/resource-state"
export default function Loading() {
  return <LoadingState variant="table" rows={8} label="Loading invoices" />
}

// error.tsx
"use client"
import { ErrorState } from "@/components/ui/resource-state"
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorState
      description="We couldn't reach the server. Your saved work is not affected."
      onRetry={reset}
      reference={error.digest}
    />
  )
}

// page.tsx, filters applied but nothing matches
<EmptyState
  icon={<SearchXIcon />}
  title="No invoices match these filters"
  description={`Nothing for “${query}” in ${monthLabel}.`}
  action={<Button variant="outline" asChild><Link href="/invoices">Clear filters</Link></Button>}
/>
```

## Constraints

- Distinguish "nothing yet" from "nothing matches": they need different words and different actions.
- Error copy should say what failed and whether the user's data is safe, but only claim it's safe when that's true.
- `ErrorState` works in server components. Passing `onRetry` (a function) needs a client component, as in `error.tsx`.
- Skeleton widths vary on purpose so the placeholder reads as content.
