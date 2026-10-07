/**
 * Rules for scripts/check-raw-colours.ts. Components must use semantic tokens
 * (bg-primary, text-muted-foreground, var(--success)…), never raw colours or
 * pixel values. Tokens live in registry/damon/theme only.
 *
 * Escape hatch for a deliberate exception: put `raw-colour-ok` in a comment on
 * the same line, with the reason.
 */

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose"
const UTILITY =
  "bg|text|border|border-[trblxyse]|ring|ring-offset|fill|stroke|from|via|to|outline|decoration|shadow|accent|caret|divide|placeholder"

export const RULES: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  { name: "hex colour", pattern: /["'`\[(:,=]\s*#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b(?![-\w])/ },
  { name: "colour function", pattern: /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(/ },
  {
    name: "Tailwind palette colour",
    pattern: new RegExp(`(?<![\\w-])(?:${UTILITY})-(?:(?:${PALETTE})-\\d{2,3}|black|white)(?![\\w-])`),
  },
  { name: "arbitrary px value", pattern: /\[[^\]\s]*\d+(?:\.\d+)?px[^\]\s]*\]/ },
  { name: "inline px value", pattern: /["'`]\s*-?\d+(?:\.\d+)?px\b/ },
]

export interface Violation {
  line: number
  rule: string
  text: string
}

export function findViolations(source: string): Violation[] {
  const out: Violation[] = []
  source.split("\n").forEach((text, i) => {
    if (text.includes("raw-colour-ok")) return
    for (const rule of RULES) {
      if (rule.pattern.test(text)) out.push({ line: i + 1, rule: rule.name, text: text.trim() })
    }
  })
  return out
}
