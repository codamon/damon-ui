"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Reveal } from "@/registry/damon/ui/reveal"

const items = ["Measure", "Design", "Build", "Install", "Finish", "Care"]

export default function RevealDemo() {
  const [run, setRun] = useState(0)
  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" onClick={() => setRun((r) => r + 1)}>
        Replay
      </Button>
      <ul key={run} className="grid gap-4 sm:grid-cols-3">
        {items.map((item, i) => (
          <Reveal as="li" key={item} delay={i * 90} className="rounded-xl border bg-card p-5">
            <p className="text-xs text-muted-foreground tabular-nums">0{i + 1}</p>
            <p className="mt-1 font-semibold">{item}</p>
          </Reveal>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Turn on “reduce motion” in your OS, or disable JavaScript, and the cards simply appear.
      </p>
    </div>
  )
}
