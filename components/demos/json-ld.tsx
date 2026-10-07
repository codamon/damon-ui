import { article, faqPage, jsonLdGraph, organization, serializeJsonLd, website } from "@/registry/damon/lib/json-ld"

const SITE = "https://kaurijoinery.co.nz"

const graph = jsonLdGraph(
  organization({
    siteUrl: SITE,
    name: "Kauri Joinery",
    logo: "/logo.png",
    address: { addressLocality: "Auckland", addressCountry: "NZ" },
  }),
  website({ siteUrl: SITE, name: "Kauri Joinery", inLanguage: "en-NZ" }),
  article({ siteUrl: SITE, path: "/blog/rimu", headline: "Caring for rimu </script>", datePublished: "2026-10-01" }),
  faqPage([{ question: "Do you work weekends?", answer: "Saturdays, by arrangement." }])
)

export default function JsonLdDemo() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Output of <code className="font-mono text-xs">serializeJsonLd(jsonLdGraph(organization(…), website(…), article(…), faqPage(…)))</code>.
        Note the escaped <code className="font-mono text-xs">&lt;/script&gt;</code> in the headline.
      </p>
      <pre className="max-h-96 overflow-auto rounded-lg bg-muted/50 p-4 font-mono text-xs leading-5">
        {JSON.stringify(JSON.parse(serializeJsonLd(graph)), null, 2)}
      </pre>
      <p className="font-mono text-xs break-all text-muted-foreground">
        raw: {serializeJsonLd({ headline: "Caring for rimu </script>" })}
      </p>
    </div>
  )
}
