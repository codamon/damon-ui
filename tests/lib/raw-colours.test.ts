import { describe, expect, it } from "vitest"

import { findViolations } from "@/scripts/raw-colours"

const rules = (src: string) => findViolations(src).map((v) => v.rule)

describe("raw colour check", () => {
  it.each([
    ['className="bg-[#ff0000]"', "hex colour"],
    ['style={{ color: "#fff" }}', "hex colour"],
    ['color: "rgb(0 0 0)"', "colour function"],
    ['fill="oklch(0.5 0.1 20)"', "colour function"],
    ['className="text-red-500"', "Tailwind palette colour"],
    ['className="hover:bg-emerald-50/50"', "Tailwind palette colour"],
    ['className="border-l-blue-600"', "Tailwind palette colour"],
    ['className="text-white"', "Tailwind palette colour"],
    ['className="h-[42px]"', "arbitrary px value"],
    ['style={{ width: "12px" }}', "inline px value"],
  ])("flags %s", (src, rule) => {
    expect(rules(src)).toContain(rule)
  })

  it.each([
    'className="bg-primary text-primary-foreground"',
    'className="text-muted-foreground border-border"',
    'className="bg-[var(--success)] text-[color:var(--success-foreground)]"',
    'className="h-9 rounded-md px-3"',
    '"@id": `${url}#organization`',
    "// see issue #123",
    'className="bg-white"  // raw-colour-ok: print stylesheet',
    'className="text-success bg-warning/10"',
  ])("allows %s", (src) => {
    expect(rules(src)).toEqual([])
  })
})
