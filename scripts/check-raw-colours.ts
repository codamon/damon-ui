/** Fails CI when a registry component uses a raw colour or px literal. */
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

import { findViolations } from "./raw-colours"

// theme/ is where tokens are defined, so it is the one place raw values belong.
const ROOTS = ["registry/damon/lib", "registry/damon/hooks", "registry/damon/ui", "registry/damon/blocks"]

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return walk(path)
    return /\.(tsx?|css)$/.test(name) ? [path] : []
  })
}

const files = ROOTS.flatMap((root) => {
  try {
    return walk(root)
  } catch {
    return []
  }
})

let count = 0
for (const file of files) {
  for (const v of findViolations(readFileSync(file, "utf8"))) {
    count++
    console.error(`${file}:${v.line}  ${v.rule}\n    ${v.text}`)
  }
}

if (count) {
  console.error(`\ncheck-raw-colours: ${count} violation(s). Use semantic tokens from registry/damon/theme.`)
  process.exit(1)
}
console.log(`check-raw-colours: ${files.length} files clean`)
