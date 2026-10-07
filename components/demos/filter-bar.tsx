"use client"

import { Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import { FilterBar, FilterChips, FilterField, FilterSearch, FilterSelect } from "@/registry/damon/ui/filter-bar"
import { buildQuery } from "@/registry/damon/ui/pager"

import { sampleInvoices } from "./sample-invoices"

const STATUS_LABELS: Record<string, string> = { paid: "Paid", unpaid: "Unpaid", overdue: "Overdue", draft: "Draft", sent: "Sent" }

function Demo() {
  const params = useSearchParams()
  const pathname = usePathname()
  const q = params.get("q") ?? ""
  const status = params.get("status") ?? ""
  const from = params.get("from") ?? ""
  const current = { q, status, from }

  const chips = [
    q && { label: `Search: ${q}`, removeHref: pathname + buildQuery({ ...current, q: null }) },
    status && { label: `Status: ${STATUS_LABELS[status] ?? status}`, removeHref: pathname + buildQuery({ ...current, status: null }) },
    from && { label: `From ${from}`, removeHref: pathname + buildQuery({ ...current, from: null }) },
  ].filter((chip): chip is { label: string; removeHref: string } => Boolean(chip))

  const count = sampleInvoices.filter(
    (r) =>
      (!q || `${r.number} ${r.customer}`.toLowerCase().includes(q.toLowerCase())) &&
      (!status || r.status === status) &&
      (!from || r.issuedOn >= from)
  ).length

  return (
    <div className="space-y-4">
      {/* key: remount so defaultValues follow the URL after chip/clear navigation */}
      <FilterBar key={params.toString()} clearHref={pathname} autoSubmit preserve={{ sort: params.get("sort") }}>
        <FilterSearch aria-label="Search" placeholder="Number or customer" defaultValue={q} />
        <FilterField label="Status">
          <FilterSelect name="status" defaultValue={status}>
            <option value="">Any</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        <FilterField label="Issued from">
          <Input type="date" name="from" defaultValue={from} className="w-40" />
        </FilterField>
      </FilterBar>
      <FilterChips filters={chips} clearHref={pathname} />
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground tabular-nums">{count}</span> of {sampleInvoices.length} invoices
        match. The filters live in the URL: <code className="font-mono text-xs">{buildQuery(current) || "(none)"}</code>
      </p>
    </div>
  )
}

export default function FilterBarDemo() {
  return (
    <Suspense fallback={<div className="h-24" />}>
      <Demo />
    </Suspense>
  )
}
