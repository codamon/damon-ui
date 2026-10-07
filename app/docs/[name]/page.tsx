import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CopyButton } from "@/components/docs/copy-button"
import { DemoFrame } from "@/components/docs/demo-frame"
import { Markdown } from "@/components/docs/markdown"
import { demos } from "@/components/demos"
import { Badge } from "@/components/ui/badge"
import { readDoc } from "@/lib/docs"
import { getItem, loadRegistry, SITE_URL } from "@/lib/registry"

export const dynamicParams = false

export function generateStaticParams() {
  return loadRegistry().items.map((item) => ({ name: item.name }))
}

export async function generateMetadata({ params }: PageProps<"/docs/[name]">): Promise<Metadata> {
  const { name } = await params
  const item = getItem(name)
  return { title: item?.title ?? name, description: item?.description }
}

export default async function ItemPage({ params }: PageProps<"/docs/[name]">) {
  const { name } = await params
  const item = getItem(name)
  if (!item) notFound()

  const doc = readDoc(name)
  const Demo = demos[name]
  const install = `npx shadcn add @damon/${name}`
  const url = `${SITE_URL}/r/${name}.json`

  return (
    <article className="max-w-3xl">
      <header className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary">{item.type.replace("registry:", "")}</Badge>
          {item.registryDependencies?.map((dep) => (
            <Badge key={dep} variant="outline" className="font-mono">
              {dep.replace(/^@damon\//, "@damon/")}
            </Badge>
          ))}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{doc.title}</h1>
        {doc.lead && <p className="mt-3 text-lg text-muted-foreground">{doc.lead}</p>}
      </header>

      <section aria-label="Install" className="mb-8 space-y-2">
        <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 py-1 pr-1 pl-4 font-mono text-sm">
          <code className="truncate">{install}</code>
          <CopyButton value={install} />
        </div>
        <p className="text-xs text-muted-foreground">
          Without the <code className="font-mono">@damon</code> alias:{" "}
          <code className="font-mono break-all">npx shadcn add {url}</code>
          {" · "}
          <a className="underline underline-offset-4" href={`/docs/${name}.md`}>
            raw markdown
          </a>
        </p>
      </section>

      {Demo && (
        <section aria-label="Demo" className="mb-10">
          <DemoFrame name={name}>
            <Demo />
          </DemoFrame>
        </section>
      )}

      <Markdown>{doc.body}</Markdown>

      {item.files && (
        <section className="mt-10 border-t pt-6 text-sm text-muted-foreground">
          <h2 className="mb-2 font-medium text-foreground">Files</h2>
          <ul className="space-y-1 font-mono text-xs">
            {item.files.map((file) => (
              <li key={file.path}>{file.target ?? file.path.replace("registry/damon/", "")}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
