"use client"

import { useState } from "react"

import { CursorPager, Pager, pageRange } from "@/registry/damon/ui/pager"

export default function PagerDemo() {
  const [page, setPage] = useState(6)
  const [small, setSmall] = useState(2)
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Pager page={page} pageCount={16} totalItems={312} pageSize={20} itemLabel="invoices" onPageChange={setPage} />
        <p className="font-mono text-xs text-muted-foreground">pageRange({page}, 16) → {JSON.stringify(pageRange(page, 16))}</p>
      </div>
      <Pager page={small} pageCount={4} onPageChange={setSmall} />
      <div className="rounded-lg border px-3 py-2">
        <CursorPager firstHref="#" nextHref="#" />
      </div>
    </div>
  )
}
