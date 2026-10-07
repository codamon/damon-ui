import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { toCssVars } from "@/scripts/sync-tokens"
import { itemTokens, mergeSets, presets, status, surfaces, type TokenMap } from "@/registry/damon/theme/tokens"

function rgb(hex: string): [number, number, number] {
  const m = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!m) throw new Error(`not a 6-digit hex: ${hex}`)
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map((c) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** `bg-success/10` over the page background, approximated in sRGB. */
function tint(colour: string, bg: string, amount = 0.1) {
  const [c, b] = [rgb(colour), rgb(bg)]
  return `#${c.map((v, i) => Math.round(v * amount + b[i] * (1 - amount)).toString(16).padStart(2, "0")).join("")}`
}

const AA = 4.5

function textPairs(t: TokenMap): [string, string, string][] {
  const pairs: [string, string, string][] = []
  const add = (fg: string, bg: string) => {
    if (t[fg] && t[bg]) pairs.push([`${fg} on ${bg}`, t[fg], t[bg]])
  }
  add("foreground", "background")
  add("card-foreground", "card")
  add("popover-foreground", "popover")
  add("primary-foreground", "primary")
  add("secondary-foreground", "secondary")
  add("muted-foreground", "background")
  add("muted-foreground", "muted")
  add("accent-foreground", "accent")
  add("destructive", "background")
  add("brand-foreground", "brand")
  add("surface-inverse-foreground", "surface-inverse")
  add("foreground", "surface-1")
  add("sidebar-foreground", "sidebar")
  add("sidebar-primary-foreground", "sidebar-primary")
  for (const tone of ["success", "warning", "info"]) {
    add(tone, "background")
    add(`${tone}-foreground`, tone)
    if (t[tone] && t.background) pairs.push([`${tone} on ${tone}/10`, t[tone], tint(t[tone], t.background)])
  }
  return pairs
}

// shadcn neutral base (oklch 1 / 0.145), for token sets that ship without a preset.
const NEUTRAL = { light: { background: "#ffffff" }, dark: { background: "#0a0a0a" } }

describe("token contrast (WCAG AA text)", () => {
  const cases = [
    ...Object.entries(presets).flatMap(([name, set]) => [
      [`${name} light`, set.light],
      [`${name} dark`, { ...set.light, ...set.dark }],
    ]),
    ["status+surfaces on neutral light", { ...mergeSets(status, surfaces).light, ...NEUTRAL.light }],
    ["status+surfaces on neutral dark", { ...mergeSets(status, surfaces).dark, ...NEUTRAL.dark }],
  ] as [string, TokenMap][]

  for (const [label, tokens] of cases) {
    it(label, () => {
      const failures = textPairs(tokens)
        .map(([pair, fg, bg]) => ({ pair, ratio: contrast(fg, bg) }))
        .filter((r) => r.ratio < AA)
        .map((r) => `${r.pair}: ${r.ratio.toFixed(2)}`)
      expect(failures).toEqual([])
    })
  }

  it("contrast helper matches known values", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 1)
    expect(contrast("#767676", "#ffffff")).toBeCloseTo(4.54, 1)
  })
})

describe("token sync", () => {
  it("registry.json cssVars match tokens.ts", () => {
    const registry = JSON.parse(readFileSync("registry.json", "utf8"))
    for (const [name, set] of Object.entries(itemTokens)) {
      const item = registry.items.find((i: { name: string }) => i.name === name)
      expect(item, `registry item ${name}`).toBeDefined()
      expect(item.cssVars, `${name} cssVars — run pnpm registry:build`).toEqual(toCssVars(set))
    }
  })

  it("dark sets define every light colour token", () => {
    for (const [name, set] of Object.entries(itemTokens)) {
      const missing = Object.keys(set.light).filter((k) => k !== "radius" && !(k in set.dark))
      expect(missing, name).toEqual([])
    }
  })
})
