/**
 * Generate public/llms.txt, public/llms-full.txt and public/docs/<name>.md
 * from registry.json + content/docs/*.md. Never hand-edit the outputs.
 *
 * Also the docs gate: fails if a registry item has no doc, or a doc is missing
 * one of the required sections.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { loadRegistry, SITE_URL } from "./registry"

const REQUIRED_SECTIONS = [
  "When to use",
  "When NOT to use",
  "Minimal example",
  "Real example",
  "Constraints",
]
// Props table for components, API table for libs/hooks.
const PROPS_SECTIONS = ["Props", "API"]

const registry = loadRegistry()
const docsDir = "content/docs"
const errors: string[] = []

const docs = registry.items.map((item) => {
  const file = join(docsDir, `${item.name}.md`)
  if (!existsSync(file)) {
    errors.push(`${item.name}: missing ${file}`)
    return { item, body: "" }
  }
  const body = readFileSync(file, "utf8").trim()
  const headings = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim())
  for (const section of REQUIRED_SECTIONS) {
    if (!headings.includes(section)) errors.push(`${item.name}: missing "## ${section}"`)
  }
  if (!PROPS_SECTIONS.some((s) => headings.includes(s))) {
    errors.push(`${item.name}: missing "## Props" or "## API"`)
  }
  if (!body.includes(`npx shadcn add @damon/${item.name}`)) {
    errors.push(`${item.name}: doc must show "npx shadcn add @damon/${item.name}"`)
  }
  return { item, body }
})

const orphans = readdirSync(docsDir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.slice(0, -3))
  .filter((name) => !registry.items.some((item) => item.name === name))
for (const name of orphans) errors.push(`content/docs/${name}.md has no registry item`)

if (errors.length) {
  console.error(`gen-llms: ${errors.length} problem(s)\n  ${errors.join("\n  ")}`)
  process.exit(1)
}

const setup = `Add the registry to components.json once:

\`\`\`json
{ "registries": { "@damon": "${SITE_URL}/r/{name}.json" } }
\`\`\`

Then install items with \`npx shadcn add @damon/<name>\`. Source is copied into the project; edit it freely.`

const groups = new Map<string, typeof docs>()
for (const doc of docs) {
  const group = doc.item.type.replace("registry:", "")
  groups.set(group, [...(groups.get(group) ?? []), doc])
}

const index = [
  `# ${registry.name}-ui`,
  "",
  "> Damon's component registry for Next.js + Tailwind v4 + shadcn/ui. Check here before writing UI, formatting helpers or SEO plumbing from scratch.",
  "",
  setup,
  "",
  ...[...groups].flatMap(([group, items]) => [
    `## ${group}`,
    "",
    ...items.map(
      ({ item }) => `- [${item.title ?? item.name}](${SITE_URL}/docs/${item.name}.md): ${item.description ?? ""}`
    ),
    "",
  ]),
  "## Optional",
  "",
  `- [Full docs in one file](${SITE_URL}/llms-full.txt)`,
  "",
].join("\n")

const full = [
  `# ${registry.name}-ui — full documentation`,
  "",
  setup,
  "",
  ...docs.map(({ body }) => `${body.replace(/^# /, "# ")}\n\n---\n`),
].join("\n")

rmSync("public/docs", { recursive: true, force: true })
mkdirSync("public/docs", { recursive: true })
for (const { item, body } of docs) writeFileSync(`public/docs/${item.name}.md`, `${body}\n`)
writeFileSync("public/llms.txt", index)
writeFileSync("public/llms-full.txt", full)
console.log(`gen-llms: ${docs.length} docs → public/llms.txt, public/llms-full.txt, public/docs/*.md`)
