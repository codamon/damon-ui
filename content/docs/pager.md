# Pager

Pagination for lists: a numbered `Pager` ("21–40 of 312 invoices", page links with ellipses) that works with URLs or state, a `CursorPager` for keyset pagination, and the `pageRange` / `buildQuery` helpers.

```bash
npx shadcn add @damon/pager
```

Installs `components/ui/pager.tsx` and shadcn's `button` if missing. Exports `Pager`, `CursorPager`, `pageRange`, `pageBounds`, `buildQuery`.

## When to use

- Under a `@damon/data-table` or any paginated list.
- URL-driven pages (`hrefFor`): every page has a link, works without JS, back button works.
- Cursor/keyset APIs that only give you "next" (`CursorPager`).

## When NOT to use

- Infinite feeds. Use "Load more" or an intersection observer.
- Fewer than ~2 pages of data. Show everything.
- Step-by-step wizards. That's a stepper, not pagination.

## Props

`Pager`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `page` | `number` | required | 1-based; clamped to range. |
| `pageCount` | `number` | required | |
| `hrefFor` | `(page) => string` | | URL mode (renders `next/link`). One of `hrefFor` / `onPageChange` is required. |
| `onPageChange` | `(page) => void` | | State mode (renders buttons). |
| `totalItems`, `pageSize` | `number` | | Both set → "21–40 of 312". Otherwise "Page 2 of 16". |
| `itemLabel` | `string` | `"results"` | Plural noun in the summary. |
| `siblings` | `number` | `1` | Page links each side of the current page. |

`CursorPager` — `nextHref: string \| null`, `firstHref: string \| null`, `nextLabel?`, `firstLabel?`. Renders nothing when both are null.

Helpers:

| Function | Example |
|---|---|
| `pageRange(current, pageCount, siblings = 1)` | `pageRange(6, 20)` → `[1, "ellipsis-start", 5, 6, 7, "ellipsis-end", 20]` (length stays constant while paging) |
| `pageBounds(page, pageSize, total)` | `pageBounds(2, 20, 312)` → `{ from: 21, to: 40 }` |
| `buildQuery(params)` | `buildQuery({ status: "paid", q: "", page: 2 })` → `"?status=paid&page=2"` |

## Minimal example

```tsx
import { buildQuery, Pager } from "@/components/ui/pager"

<Pager
  page={page}
  pageCount={Math.ceil(total / 25)}
  totalItems={total}
  pageSize={25}
  hrefFor={(p) => `/invoices${buildQuery({ ...filters, page: p })}`}
/>
```

## Real example

Keyset pagination for a ledger where the API returns a cursor:

```tsx
// app/ledger/page.tsx
import { buildQuery, CursorPager } from "@/components/ui/pager"

export default async function Page({ searchParams }: PageProps<"/ledger">) {
  const sp = await searchParams
  const { rows, nextCursor } = await api.ledger.list({ after: sp.after as string | undefined, limit: 50 })
  return (
    <section className="rounded-lg border">
      <LedgerTable rows={rows} />
      <CursorPager
        className="border-t px-3 py-2"
        nextHref={nextCursor ? `/ledger${buildQuery({ after: nextCursor })}` : null}
        firstHref={sp.after ? "/ledger" : null}
      />
    </section>
  )
}
```

## Constraints

- Previous/next are disabled (not hidden) at the ends, so the controls don't shift.
- Current page has `aria-current="page"`; the nav has `aria-label="Pagination"`.
- Numbers use `en-NZ` grouping explicitly, never the runtime default locale.
- `buildQuery` drops `null`, `undefined` and `""`, so "remove a filter" is `{ ...params, status: null }`.
- Cursor pagination has no "previous". Offer "First page" instead; storing a cursor stack is rarely worth it.
