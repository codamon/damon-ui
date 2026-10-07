"use client"

import { useSyncExternalStore } from "react"

import {
  addDays,
  differenceInDays,
  formatNzDate,
  formatNzDateTime,
  nzTaxYear,
  todayInNz,
} from "@/registry/damon/lib/nz-date"

// Read the clock only on the client (null in the static HTML), so hydration matches.
let clientNow: number | undefined
const subscribe = () => () => {}
const getNow = () => (clientNow ??= Date.now())
const getServerNow = () => null

export default function NzDateDemo() {
  const now = useSyncExternalStore(subscribe, getNow, getServerNow)

  const today = now === null ? null : todayInNz(now)
  const due = today && addDays(today, 20)

  const rows: [string, string][] = [
    ["todayInNz()", today ?? "…"],
    ["new Date().toISOString().slice(0, 10)", now === null ? "…" : new Date(now).toISOString().slice(0, 10)],
    ["formatNzDateTime(now)", now === null ? "…" : formatNzDateTime(now)],
    ["formatNzDate(addDays(today, 20), { weekday: true })", due ? formatNzDate(due, { weekday: true }) : "…"],
    ['differenceInDays("2027-03-31", today)', today ? String(differenceInDays("2027-03-31", today)) : "…"],
    ["nzTaxYear(today)", today ? String(nzTaxYear(today)) : "…"],
    ['formatNzDate("2026-03-31")', formatNzDate("2026-03-31")],
  ]

  return (
    <div className="space-y-3">
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([call, result]) => (
            <tr key={call} className="border-b last:border-0">
              <td className="py-2 pr-4 font-mono text-xs">{call}</td>
              <td className="py-2 text-right font-mono tabular-nums">{result}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground">
        The second row is the common bug: it is the UTC date, a day behind NZ every morning until noon (1pm during daylight saving).
      </p>
    </div>
  )
}
