import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import {
  absoluteUrl,
  article,
  faqPage,
  JsonLd,
  jsonLdGraph,
  nodeId,
  organization,
  serializeJsonLd,
  service,
  website,
} from "@/registry/damon/lib/json-ld"

const SITE = "https://kaurijoinery.co.nz/some/page?x=1"

describe("serializeJsonLd", () => {
  it("cannot be broken out of a script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>", amp: "a & b" })
    expect(out).not.toContain("<")
    expect(out).not.toContain(">")
    expect(out).not.toContain("&")
    expect(JSON.parse(out)).toEqual({ name: "</script><script>alert(1)</script>", amp: "a & b" })
  })

  it("escapes line separators and drops undefined", () => {
    const out = serializeJsonLd({ text: "a b c", gone: undefined })
    expect(out).toBe('{"text":"a\\u2028b\\u2029c"}')
  })

  it("renders one script element", () => {
    const html = renderToStaticMarkup(<JsonLd data={{ "@type": "Thing", name: "</script>" }} />)
    expect(html).toMatch(/^<script type="application\/ld\+json">\{.*\}<\/script>$/)
    expect(html.match(/<\/script>/g)).toHaveLength(1)
  })
})

describe("builders", () => {
  it("derive stable ids from the origin", () => {
    expect(nodeId(SITE, "organization")).toBe("https://kaurijoinery.co.nz/#organization")
    expect(absoluteUrl(SITE, "/logo.png")).toBe("https://kaurijoinery.co.nz/logo.png")
    expect(absoluteUrl(SITE, "https://cdn.example/x.png")).toBe("https://cdn.example/x.png")
  })

  it("link organization and website in one graph", () => {
    const graph = jsonLdGraph(
      organization({
        siteUrl: SITE,
        name: "Kauri Joinery",
        logo: "/logo.png",
        address: { addressLocality: "Auckland", addressCountry: "NZ" },
        sameAs: [],
      }),
      website({ siteUrl: SITE, name: "Kauri Joinery", inLanguage: "en-NZ" }),
      null,
      false
    )
    const parsed = JSON.parse(serializeJsonLd(graph))
    expect(parsed["@context"]).toBe("https://schema.org")
    expect(parsed["@graph"]).toHaveLength(2)
    const [org, site] = parsed["@graph"]
    expect(org).toEqual({
      "@type": "Organization",
      "@id": "https://kaurijoinery.co.nz/#organization",
      name: "Kauri Joinery",
      url: "https://kaurijoinery.co.nz/",
      logo: "https://kaurijoinery.co.nz/logo.png",
      address: { "@type": "PostalAddress", addressLocality: "Auckland", addressCountry: "NZ" },
    })
    expect(site.publisher).toEqual({ "@id": org["@id"] })
  })

  it("builds service and article nodes", () => {
    const svc = service({ siteUrl: SITE, path: "/kitchens", name: "Kitchens", description: "Custom kitchens", areaServed: "New Zealand" })
    expect(svc["@id"]).toBe("https://kaurijoinery.co.nz/kitchens#service")
    expect(svc.areaServed).toEqual({ "@type": "Country", name: "New Zealand" })
    expect(svc.provider).toEqual({ "@id": "https://kaurijoinery.co.nz/#organization" })

    const post = article({
      siteUrl: SITE,
      path: "/blog/rimu",
      headline: "Caring for rimu",
      datePublished: "2026-10-01",
      images: ["/img/rimu.jpg"],
      keywords: ["rimu", "timber"],
    })
    expect(post.dateModified).toBe("2026-10-01")
    expect(post.author).toEqual({ "@id": "https://kaurijoinery.co.nz/#organization" })
    expect(post.image).toEqual(["https://kaurijoinery.co.nz/img/rimu.jpg"])
    expect(post.keywords).toBe("rimu, timber")
    expect(article({ siteUrl: SITE, path: "/b", headline: "h", datePublished: "2026-01-01", authors: ["Aroha"] }).author).toEqual([
      { "@type": "Person", name: "Aroha" },
    ])
  })

  it("builds FAQPage only from complete pairs", () => {
    expect(faqPage([])).toBeNull()
    expect(faqPage([{ question: " ", answer: "x" }])).toBeNull()
    const faq = faqPage([
      { question: "Do you work weekends?", answer: "Saturdays, by arrangement." },
      { question: "", answer: "dropped" },
    ])!
    expect(faq.mainEntity).toEqual([
      { "@type": "Question", name: "Do you work weekends?", acceptedAnswer: { "@type": "Answer", text: "Saturdays, by arrangement." } },
    ])
  })
})
