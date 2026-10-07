"use client"

import { useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

const PRESETS = [
  { value: "default", label: "Default" },
  { value: "marketing", label: "Marketing" },
  { value: "admin", label: "Admin" },
] as const

export type Preset = (typeof PRESETS)[number]["value"]

/** Preview area. The preset switch scopes theme tokens to the demo only. */
export function DemoFrame({
  name,
  defaultPreset = "default",
  children,
}: {
  name: string
  defaultPreset?: Preset
  children: ReactNode
}) {
  const [preset, setPreset] = useState<Preset>(defaultPreset)

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">Preview</span>
        <div role="radiogroup" aria-label="Theme preset" className="flex gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              role="radio"
              aria-checked={preset === p.value}
              onClick={() => setPreset(p.value)}
              className={cn(
                "rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground",
                preset === p.value && "bg-background font-medium text-foreground shadow-xs"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div
        data-demo={name}
        data-theme={preset === "default" ? undefined : preset}
        className="bg-background p-6 text-foreground md:p-10"
      >
        {children}
      </div>
    </div>
  )
}
