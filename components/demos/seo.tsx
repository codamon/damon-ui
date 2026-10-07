import { createSeo, hreflangAlternates, plainText, truncate } from "@/registry/damon/lib/seo"

const seo = createSeo({
  siteName: "Kauri Joinery",
  siteUrl: "https://kaurijoinery.co.nz",
  defaultImage: { url: "/og.png", width: 1200, height: 630, alt: "Kauri Joinery" },
})

const body =
  "## Caring for rimu\n\nRimu is a **native timber** that darkens with age. Oil it twice a year, keep it out of direct sun, and wipe spills quickly. See [our care guide](/care) for products we trust."

const meta = seo.article({
  title: "Caring for rimu",
  description: truncate(plainText(body), 120),
  path: "/blog/rimu",
  publishedTime: "2026-10-01",
  tags: ["rimu", "timber"],
  languages: hreflangAlternates("/blog/rimu", { "en-NZ": "", "zh-CN": "/zh" }, "en-NZ"),
})

export default function SeoDemo() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        <code className="font-mono text-xs">seo.article(…)</code> with a description built by{" "}
        <code className="font-mono text-xs">truncate(plainText(body), 120)</code>:
      </p>
      <pre className="max-h-96 overflow-auto rounded-lg bg-muted/50 p-4 font-mono text-xs leading-5">
        {JSON.stringify(meta, null, 2)}
      </pre>
    </div>
  )
}
