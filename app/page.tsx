import Link from "next/link"

import { CopyButton } from "@/components/docs/copy-button"
import { groupedItems, SITE_URL } from "@/lib/registry"

const registriesSnippet = `{
  "registries": {
    "@damon": "${SITE_URL}/r/{name}.json"
  }
}`

export default function Home() {
  const groups = groupedItems()

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
      <section className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">damon-ui</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A shadcn registry of components and helpers that have already shipped in real projects. Install one with a
          single command, then edit the copied source. Every item has a markdown doc written for AI agents.
        </p>
      </section>

      <section className="mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h2 className="text-sm font-medium">1. Add the registry to components.json</h2>
          <div className="relative mt-3">
            <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3 font-mono text-xs leading-5">
              {registriesSnippet}
            </pre>
            <div className="absolute top-1 right-1">
              <CopyButton value={registriesSnippet} />
            </div>
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <h2 className="text-sm font-medium">2. Install items</h2>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-muted/50 p-3 font-mono text-xs leading-5">
            npx shadcn add @damon/nz-money
          </pre>
          <p className="mt-3 text-xs text-muted-foreground">
            Agents: start from{" "}
            <a href="/llms.txt" className="underline underline-offset-4">
              /llms.txt
            </a>
            .
          </p>
        </div>
      </section>

      <div className="mt-14 space-y-10">
        {groups.map((group) => (
          <section key={group.type}>
            <h2 className="mb-4 text-sm font-medium tracking-wide text-muted-foreground uppercase">{group.label}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <li key={item.name}>
                  <Link
                    href={`/docs/${item.name}`}
                    className="block h-full rounded-xl border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="font-medium">{item.title ?? item.name}</div>
                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
