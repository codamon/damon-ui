/**
 * Structured data (schema.org JSON-LD) for Next.js pages.
 *
 * - `<JsonLd data={…} />` renders a safe `<script type="application/ld+json">`.
 * - Builders return plain objects with stable `@id`s (`https://site/#organization`),
 *   so nodes in one `@graph` reference each other instead of repeating facts.
 *
 * Only state what is true and visible on the page. Structured data that
 * overstates a business can get the whole site flagged, not just one property.
 */

export type JsonLdNode = { "@type": string | string[]; "@id"?: string } & Record<string, unknown>
export type JsonLdDocument = Record<string, unknown>

/**
 * JSON for embedding in a `<script>` tag. Escapes `<`, `>` and `&` (so a
 * value containing `</script>` cannot break out) and the U+2028/U+2029 line
 * separators. `undefined` properties are dropped.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}

/** Render JSON-LD. Works in server components; put it anywhere in the page. */
export function JsonLd({ data }: { data: JsonLdDocument | JsonLdNode | JsonLdNode[] }) {
  // Content is escaped by serializeJsonLd; this is the documented way to emit JSON-LD in React.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
}

/** Wrap nodes in one document: `{ "@context": "https://schema.org", "@graph": [...] }`. */
export function jsonLdGraph(...nodes: Array<JsonLdNode | null | undefined | false>): JsonLdDocument {
  return { "@context": "https://schema.org", "@graph": nodes.filter(Boolean) }
}

/** `https://example.co.nz` from any URL or origin string, without a trailing slash. */
export function siteOrigin(siteUrl: string | URL): string {
  return new URL(siteUrl).origin
}

/** Stable node id: `nodeId("https://x.nz", "organization")` → `"https://x.nz/#organization"`. */
export function nodeId(siteUrl: string | URL, name: string): string {
  return `${siteOrigin(siteUrl)}/#${name}`
}

/** Absolute URL for a path on the site; absolute URLs pass through. */
export function absoluteUrl(siteUrl: string | URL, pathOrUrl: string): string {
  return new URL(pathOrUrl, siteOrigin(siteUrl)).toString()
}

const ref = (id: string) => ({ "@id": id })

export interface PostalAddress {
  streetAddress?: string
  addressLocality?: string
  addressRegion?: string
  postalCode?: string
  /** ISO country code, e.g. `"NZ"`. */
  addressCountry?: string
}

export interface OrganizationInput {
  siteUrl: string | URL
  name: string
  /** Path or URL to a square logo (at least 112×112). */
  logo?: string
  email?: string
  telephone?: string
  description?: string
  address?: PostalAddress
  /** Profiles that are verifiably this organisation: LinkedIn, Google Business Profile… */
  sameAs?: string[]
  /** Default `"Organization"`. Use e.g. `"LocalBusiness"` or `["Organization", "ProfessionalService"]`. */
  type?: string | string[]
}

/** Organization node, `@id` `<origin>/#organization`. */
export function organization(input: OrganizationInput): JsonLdNode {
  return {
    "@type": input.type ?? "Organization",
    "@id": nodeId(input.siteUrl, "organization"),
    name: input.name,
    url: absoluteUrl(input.siteUrl, "/"),
    logo: input.logo ? absoluteUrl(input.siteUrl, input.logo) : undefined,
    email: input.email,
    telephone: input.telephone,
    description: input.description,
    address: input.address ? { "@type": "PostalAddress", ...input.address } : undefined,
    sameAs: input.sameAs?.length ? input.sameAs : undefined,
  }
}

/** WebSite node, `@id` `<origin>/#website`, published by the organization node. */
export function website(input: { siteUrl: string | URL; name: string; description?: string; inLanguage?: string }): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": nodeId(input.siteUrl, "website"),
    url: absoluteUrl(input.siteUrl, "/"),
    name: input.name,
    description: input.description,
    inLanguage: input.inLanguage,
    publisher: ref(nodeId(input.siteUrl, "organization")),
  }
}

/** Service offered by the organization, at a page on the site. */
export function service(input: {
  siteUrl: string | URL
  path: string
  name: string
  description: string
  /** Country name or list, e.g. `"New Zealand"`. */
  areaServed?: string | string[]
  serviceType?: string
}): JsonLdNode {
  const url = absoluteUrl(input.siteUrl, input.path)
  const areas = typeof input.areaServed === "string" ? [input.areaServed] : input.areaServed
  return {
    "@type": "Service",
    "@id": `${url}#service`,
    name: input.name,
    description: input.description,
    url,
    serviceType: input.serviceType,
    provider: ref(nodeId(input.siteUrl, "organization")),
    areaServed: areas?.length
      ? areas.length === 1
        ? { "@type": "Country", name: areas[0] }
        : areas.map((name) => ({ "@type": "Country", name }))
      : undefined,
  }
}

/** Article / BlogPosting for a post page. Dates are ISO strings. */
export function article(input: {
  siteUrl: string | URL
  path: string
  headline: string
  description?: string
  /** Paths or URLs. */
  images?: string[]
  datePublished: string
  dateModified?: string
  /** Person names; omit to attribute the organization. */
  authors?: string[]
  section?: string
  keywords?: string[]
  type?: "Article" | "BlogPosting" | "NewsArticle"
}): JsonLdNode {
  const url = absoluteUrl(input.siteUrl, input.path)
  const orgId = nodeId(input.siteUrl, "organization")
  return {
    "@type": input.type ?? "Article",
    "@id": `${url}#article`,
    headline: input.headline,
    description: input.description,
    image: input.images?.length ? input.images.map((src) => absoluteUrl(input.siteUrl, src)) : undefined,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: input.authors?.length ? input.authors.map((name) => ({ "@type": "Person", name })) : ref(orgId),
    publisher: ref(orgId),
    articleSection: input.section,
    keywords: input.keywords?.length ? input.keywords.join(", ") : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  }
}

/** FAQPage from question/answer pairs that are visible on the page. Returns `null` when empty. */
export function faqPage(items: Array<{ question: string; answer: string }>): JsonLdNode | null {
  const valid = items.filter((item) => item.question.trim() && item.answer.trim())
  if (valid.length === 0) return null
  return {
    "@type": "FAQPage",
    mainEntity: valid.map((item) => ({
      "@type": "Question",
      name: item.question.trim(),
      acceptedAnswer: { "@type": "Answer", text: item.answer.trim() },
    })),
  }
}
