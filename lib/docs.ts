import { readFileSync } from "node:fs"
import { join } from "node:path"

export interface ParsedDoc {
  title: string
  lead: string
  body: string
}

/**
 * Split an item doc into title, lead paragraph and body. The page renders the
 * install command itself, so the doc's own `npx shadcn add` block is dropped.
 */
export function readDoc(name: string): ParsedDoc {
  const source = readFileSync(join(process.cwd(), "content/docs", `${name}.md`), "utf8")
  const title = /^# (.+)$/m.exec(source)?.[1].trim() ?? name
  let rest = source.replace(/^# .+\n+/m, "")
  const leadMatch = /^(?!#|```)([^\n]+(?:\n(?!\n)[^\n]+)*)\n*/.exec(rest)
  const lead = leadMatch?.[1].trim() ?? ""
  if (leadMatch) rest = rest.slice(leadMatch[0].length)
  rest = rest.replace(/^```bash\nnpx shadcn add[^\n]*\n```\n*/m, "")
  return { title, lead, body: rest.trim() }
}
