"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/registry/damon/ui/confirm-dialog"

export default function ConfirmDialogDemo() {
  const [log, setLog] = useState<string[]>([])
  const [failNext, setFailNext] = useState(true)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setLog((l) => [...l, "form submitted: delete INV-0026"])
          }}
        >
          <ConfirmDialog
            trigger={<Button variant="destructive">Delete invoice</Button>}
            title="Delete invoice INV-0026?"
            description="Its payments and PDF are deleted too. Reports for October will change."
            confirmLabel="Delete invoice"
          />
        </form>
        <ConfirmDialog
          trigger={<Button variant="outline">Cancel order (async)</Button>}
          title="Cancel order #1042?"
          description="The customer is refunded $184.00 and notified by email."
          confirmLabel="Cancel and refund"
          cancelLabel="Keep order"
          onConfirm={async () => {
            await new Promise((r) => setTimeout(r, 900))
            if (failNext) {
              setFailNext(false)
              throw new Error("The payment provider didn't accept the refund. Nothing was changed. Try again.")
            }
            setLog((l) => [...l, "order cancelled"])
            setFailNext(true)
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground">The async example fails on the first try to show the error state.</p>
      {log.length ? (
        <ul className="font-mono text-xs text-muted-foreground">
          {log.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
