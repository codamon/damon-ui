# Data table

A table for admin lists, driven by plain column definitions: sortable columns (client-side or via URL), row selection with a bulk-action bar, a Columns visibility menu, and empty and loading states. No table library. Built on shadcn's `Table`.

```bash
npx shadcn add @damon/data-table
```

Installs `components/ui/data-table.tsx` and shadcn's `table`, `checkbox`, `dropdown-menu`, `button`, `skeleton` if missing. Pairs with `@damon/filter-bar`, `@damon/pager`, `@damon/status-badge`, `@damon/resource-state`.

## When to use

- Lists of records in an admin or SaaS app: invoices, orders, customers, jobs.
- Up to a few hundred rows sorted on the client, or any size sorted and paginated on the server (`sortHref` + `<Pager hrefFor>`).
- When you need bulk actions ("Mark 3 as paid") or let people hide columns.

## When NOT to use

- Spreadsheet-like editing, column resizing, virtualisation of 10k+ rows, grouping or pivoting. Use TanStack Table (shadcn's data-table guide) or AG Grid.
- Two-column key/value details. Use a `<dl>`.
- Simple static tables in content. Use shadcn's `Table` directly.

## Props

`DataTableColumn<T>`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Stable key for sort, visibility, `data-column`. |
| `header` | `ReactNode` | |
| `cell` | `(row: T) => ReactNode` | |
| `sortValue` | `(row: T) => string \| number \| bigint \| boolean \| Date \| null` | Makes the column sortable on the client. Empty values sort last in both directions; text sorts naturally (INV-2 before INV-10). |
| `sortable` | `boolean` | Sortable without `sortValue` (server sorting with `sortHref`). |
| `numeric` | `boolean` | Right-aligned, `tabular-nums`. |
| `hideable` | `boolean` | Default `true`. Set `false` for the identifying column. |
| `defaultHidden` | `boolean` | Starts hidden; user can turn it on. |
| `label` | `string` | Name in the Columns menu when `header` isn't a string. |
| `className`, `headerClassName` | `string` | |

`DataTable<T>`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns`, `rows` | | required | |
| `getRowId` | `(row: T) => string` | required | |
| `caption` | `string` | required | Screen-reader caption. |
| `defaultSort` | `{ id, direction: "asc" \| "desc" } \| null` | `null` | Uncontrolled. |
| `sort`, `onSortChange` | | | Controlled. |
| `sortHref` | `(sort) => string` | | Headers become links; rows are rendered in the given order (server sorts). |
| `selectable` | `boolean` | `false` | Row checkboxes + select-all (indeterminate when partial). |
| `selected`, `onSelectedChange` | `Set<string>` | | Controlled selection. |
| `bulkActions` | `(ids, clear) => ReactNode` | | Bar shown while rows are selected. |
| `rowLabel` | `(row) => string` | `"Select row n"` | Checkbox accessible name. |
| `columnToggle` | `boolean` | auto (4+ columns) | Columns menu. |
| `toolbar` | `ReactNode` | | Left of the Columns button. |
| `footer` | `ReactNode` | | Usually a `<Pager>`. |
| `empty` | `ReactNode` | "No results." | E.g. an `<EmptyState>`. |
| `loading` | `boolean` | `false` | Skeleton rows, `aria-busy`. |
| `density` | `"compact" \| "comfortable"` | `"comfortable"` | |
| `rowClassName` | `(row) => string` | | |

Also exported: `sortRows(rows, column, direction)`, `compareSortValues(a, b)`, `nextSort(current, id)`.

## Minimal example

```tsx
"use client"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { formatMoney } from "@/lib/nz-money"

const columns: DataTableColumn<Invoice>[] = [
  { id: "number", header: "Invoice", cell: (r) => r.number, sortValue: (r) => r.number, hideable: false },
  { id: "customer", header: "Customer", cell: (r) => r.customer, sortValue: (r) => r.customer },
  { id: "total", header: "Total", numeric: true, cell: (r) => formatMoney(r.total), sortValue: (r) => Number(r.total) },
]

<DataTable caption="Invoices" columns={columns} rows={invoices} getRowId={(r) => r.id} />
```

## Real example

Server-sorted, server-paginated list driven by the URL. The page is a server component; the table is a client component given serialisable rows.

```tsx
// app/invoices/page.tsx (server)
import { buildQuery } from "@/components/ui/pager"
import { InvoiceTable } from "./invoice-table"

export default async function Page({ searchParams }: PageProps<"/invoices">) {
  const sp = await searchParams
  const sort = { id: String(sp.sort ?? "issued"), direction: sp.dir === "asc" ? "asc" : "desc" } as const
  const page = Number(sp.page ?? 1)
  const { rows, total } = await db.invoices.list({ sort, page, pageSize: 25, status: sp.status })
  return <InvoiceTable rows={rows} total={total} page={page} sort={sort} params={{ status: sp.status as string }} />
}

// app/invoices/invoice-table.tsx (client)
"use client"
export function InvoiceTable({ rows, total, page, sort, params }: Props) {
  return (
    <DataTable
      caption="Invoices"
      columns={columns /* sortable: true on server-sortable columns */}
      rows={rows}
      getRowId={(r) => r.id}
      sort={sort}
      sortHref={(s) => `/invoices${buildQuery({ ...params, sort: s.id, dir: s.direction })}`}
      selectable
      rowLabel={(r) => `Select ${r.number}`}
      bulkActions={(ids, clear) => <MarkPaidButton ids={ids} onDone={clear} />}
      empty={<EmptyState title="No invoices yet" action={<Button asChild><Link href="/invoices/new">New invoice</Link></Button>} />}
      footer={
        <Pager
          page={page}
          pageCount={Math.ceil(total / 25)}
          totalItems={total}
          pageSize={25}
          hrefFor={(p) => `/invoices${buildQuery({ ...params, sort: sort.id, dir: sort.direction, page: p })}`}
        />
      }
    />
  )
}
```

## Constraints

- Client component. Column `cell` functions can't be passed from a server component; define columns in the client file.
- Client sorting is for data already on the page. For paginated data, sort on the server, or you'll sort one page only.
- Selection only counts rows currently displayed, so filtering never leaves hidden rows selected.
- Keep `getRowId` stable (database id), not the array index.
- Narrow screens scroll horizontally inside the table container; keep the identifying column first.
