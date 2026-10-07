"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { formatNzDate } from "@/registry/damon/lib/nz-date"
import { formatMoney } from "@/registry/damon/lib/nz-money"
import { DataTable, type DataTableColumn } from "@/registry/damon/ui/data-table"
import { FilterSearch } from "@/registry/damon/ui/filter-bar"
import { Pager } from "@/registry/damon/ui/pager"
import { EmptyState } from "@/registry/damon/ui/resource-state"
import { StatusBadge } from "@/registry/damon/ui/status-badge"

import { sampleInvoices, type SampleInvoice } from "./sample-invoices"

const PAGE_SIZE = 8

const columns: DataTableColumn<SampleInvoice>[] = [
  {
    id: "number",
    header: "Invoice",
    cell: (row) => <span className="font-medium">{row.number}</span>,
    sortValue: (row) => row.number,
    hideable: false,
  },
  { id: "customer", header: "Customer", cell: (row) => row.customer, sortValue: (row) => row.customer },
  { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} />, sortValue: (row) => row.status },
  { id: "issued", header: "Issued", cell: (row) => formatNzDate(row.issuedOn), sortValue: (row) => row.issuedOn },
  {
    id: "due",
    header: "Due",
    cell: (row) => <span className={row.dueOn ? undefined : "text-muted-foreground"}>{formatNzDate(row.dueOn)}</span>,
    sortValue: (row) => row.dueOn,
    defaultHidden: true,
  },
  { id: "total", header: "Total", numeric: true, cell: (row) => formatMoney(row.total), sortValue: (row) => Number(row.total) },
]

export default function DataTableDemo() {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? sampleInvoices.filter((r) => `${r.number} ${r.customer}`.toLowerCase().includes(q)) : sampleInvoices
  }, [query])
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  return (
    <DataTable
      caption="Invoices"
      columns={columns}
      rows={rows}
      getRowId={(row) => row.id}
      rowLabel={(row) => `Select ${row.number}`}
      defaultSort={{ id: "issued", direction: "desc" }}
      selectable
      loading={loading}
      bulkActions={(ids, clear) => (
        <>
          <Button size="sm" variant="outline" onClick={clear}>
            Mark {ids.length} as paid
          </Button>
          <Button size="sm" variant="outline" onClick={clear}>
            Export
          </Button>
        </>
      )}
      toolbar={
        <>
          <FilterSearch
            aria-label="Search invoices"
            placeholder="Search number or customer"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLoading(true)
              setTimeout(() => setLoading(false), 1200)
            }}
          >
            Simulate loading
          </Button>
        </>
      }
      empty={
        <EmptyState
          className="border-0"
          title="No invoices match"
          description={`Nothing for “${query}”.`}
          action={
            <Button variant="outline" onClick={() => setQuery("")}>
              Clear search
            </Button>
          }
        />
      }
      footer={
        <Pager
          page={current}
          pageCount={pageCount}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          itemLabel="invoices"
          onPageChange={setPage}
        />
      }
    />
  )
}
