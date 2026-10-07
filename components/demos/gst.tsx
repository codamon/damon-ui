"use client"

import { useId, useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatGstNumber, isValidGstNumber, normalizeGstNumber, splitInclusive, inclusiveFromExclusive } from "@/registry/damon/lib/gst"
import { formatMoney } from "@/registry/damon/lib/nz-money"

function safeSplit(amount: string, inclusive: boolean) {
  try {
    const gross = inclusive ? amount : inclusiveFromExclusive(amount)
    return splitInclusive(gross)
  } catch {
    return null
  }
}

export default function GstDemo() {
  const id = useId()
  const [amount, setAmount] = useState("49.99")
  const [inclusive, setInclusive] = useState(true)
  const [gstNumber, setGstNumber] = useState("49-091-850")

  const split = safeSplit(amount, inclusive)
  const normalized = normalizeGstNumber(gstNumber)
  const valid = isValidGstNumber(gstNumber)

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-3">
        <Label htmlFor={`${id}-amount`}>Amount</Label>
        <div className="flex gap-2">
          <Input
            id={`${id}-amount`}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="tabular-nums"
          />
          <div role="radiogroup" aria-label="Amount includes GST" className="flex rounded-md border p-0.5 text-xs">
            {[true, false].map((value) => (
              <button
                key={String(value)}
                type="button"
                role="radio"
                aria-checked={inclusive === value}
                onClick={() => setInclusive(value)}
                className="rounded px-2 text-muted-foreground aria-checked:bg-muted aria-checked:text-foreground"
              >
                {value ? "incl." : "excl."}
              </button>
            ))}
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-y-1 text-sm tabular-nums">
          <dt className="text-muted-foreground">Net</dt>
          <dd className="text-right">{split ? formatMoney(split.net) : "—"}</dd>
          <dt className="text-muted-foreground">GST 15%</dt>
          <dd className="text-right">{split ? formatMoney(split.gst) : "—"}</dd>
          <dt className="font-medium">Total</dt>
          <dd className="text-right font-medium">{split ? formatMoney(split.gross) : "Not a decimal amount"}</dd>
        </dl>
      </div>

      <div className="space-y-3">
        <Label htmlFor={`${id}-gst`}>GST number</Label>
        <Input
          id={`${id}-gst`}
          value={gstNumber}
          onChange={(e) => setGstNumber(e.target.value)}
          aria-invalid={gstNumber !== "" && !valid}
        />
        <p className="text-sm" aria-live="polite">
          {gstNumber === "" ? (
            <span className="text-muted-foreground">Try 136410132 or 49091851.</span>
          ) : valid ? (
            <span className="text-success">Valid: {formatGstNumber(gstNumber)}</span>
          ) : (
            <span className="text-destructive">
              Fails the IRD check{normalized ? ` (${normalized})` : ""}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
