# Filter bar

Filters for a list page as a plain GET form. Submitting updates the URL query, so filtered views can be shared and bookmarked, survive a reload, and work before JavaScript loads. Includes a search input, a native select, removable filter chips, auto-submit, and preserved params.

```bash
npx shadcn add @damon/filter-bar
```

Installs `components/ui/filter-bar.tsx` and shadcn's `button`, `input` if missing. Exports `FilterBar`, `FilterField`, `FilterSearch`, `FilterSelect`, `FilterChips`.

## When to use

- Above a `@damon/data-table` or any list whose data is loaded on the server from `searchParams`.
- When filtered views should have URLs ("send me the overdue invoices link").
- Simple filter sets: search, a few selects, a date range.

## When NOT to use

- Instant client-side filtering of data already on the page. A controlled `<FilterSearch value onChange>` alone is enough (see the data-table demo).
- Complex query builders (AND/OR groups, saved views). Build a dedicated UI.
- Forms that change data. This is `method="get"` only.

## Props

`FilterBar` — all `<form>` props except `method`, plus:

| Prop | Type | Default | Notes |
|---|---|---|---|
| `clearHref` | `string` | | "Clear" link; hidden when omitted. |
| `autoSubmit` | `boolean` | `false` | Submit when a select, checkbox, radio or date changes. Text waits for Enter/Apply. |
| `preserve` | `Record<string, string \| number \| null>` | | Hidden inputs, e.g. `{ sort, dir }`, so filtering keeps the sort. |
| `applyLabel` / `clearLabel` | `string` | `"Apply"` / `"Clear"` | |

`FilterField` — `label: ReactNode`, `children` (wrapped in a `<label>`, no ids needed).
`FilterSearch` — shadcn `Input` props; defaults `name="q"`, `type="search"`; has a search icon.
`FilterSelect` — native `<select>` props, styled like shadcn inputs.
`FilterChips` — `filters: { label: ReactNode; removeHref: string }[]`, `clearHref?`, `clearLabel?`. Renders nothing when empty.

## Minimal example

```tsx
import { FilterBar, FilterField, FilterSearch, FilterSelect } from "@/components/ui/filter-bar"

<FilterBar clearHref="/invoices">
  <FilterSearch aria-label="Search invoices" defaultValue={sp.q} />
  <FilterField label="Status">
    <FilterSelect name="status" defaultValue={sp.status ?? ""}>
      <option value="">Any</option>
      <option value="unpaid">Unpaid</option>
      <option value="overdue">Overdue</option>
    </FilterSelect>
  </FilterField>
</FilterBar>
```

## Real example

Server page reading filters, keeping the sort, showing chips:

```tsx
// app/invoices/page.tsx
import { Input } from "@/components/ui/input"
import { FilterBar, FilterChips, FilterField, FilterSearch, FilterSelect } from "@/components/ui/filter-bar"
import { buildQuery } from "@/components/ui/pager"

export default async function Page({ searchParams }: PageProps<"/invoices">) {
  const sp = await searchParams
  const current = { q: sp.q as string, status: sp.status as string, from: sp.from as string, sort: sp.sort as string }
  const without = (key: keyof typeof current) => `/invoices${buildQuery({ ...current, [key]: null })}`

  return (
    <>
      <FilterBar key={buildQuery(current)} clearHref="/invoices" autoSubmit preserve={{ sort: current.sort }}>
        <FilterSearch aria-label="Search invoices" placeholder="Number or customer" defaultValue={current.q} />
        <FilterField label="Status">
          <FilterSelect name="status" defaultValue={current.status ?? ""}>…</FilterSelect>
        </FilterField>
        <FilterField label="Issued from">
          <Input type="date" name="from" defaultValue={current.from} className="w-40" />
        </FilterField>
      </FilterBar>
      <FilterChips
        className="mt-3"
        clearHref="/invoices"
        filters={[
          current.q && { label: `Search: ${current.q}`, removeHref: without("q") },
          current.status && { label: `Status: ${current.status}`, removeHref: without("status") },
          current.from && { label: `From ${current.from}`, removeHref: without("from") },
        ].filter(Boolean) as { label: string; removeHref: string }[]}
      />
      <InvoiceTable … />
    </>
  )
}
```

## Constraints

- Inputs are uncontrolled (`defaultValue`). Give `FilterBar` a `key` derived from the query so values reset after a chip or Clear link navigates.
- Validate every param on the server; the URL is user input. Ignore unknown status values and malformed dates.
- Empty fields are still submitted as `?status=`; treat empty strings as "no filter" when reading.
- Client component (for auto-submit). The form still works with JavaScript disabled, minus auto-submit.
- Has `role="search"` for landmark navigation.
