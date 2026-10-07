# JSON-LD

Structured data for Next.js pages: a `<JsonLd>` component that can't be broken out of its `<script>` tag, and schema.org builders with stable `@id`s so nodes reference each other instead of repeating facts.

```bash
npx shadcn add @damon/json-ld
```

Installs `lib/json-ld.tsx`. No dependencies.

## When to use

- Every marketing site: an `Organization` + `WebSite` graph in the root layout.
- Service pages (`service`), blog posts (`article`) and FAQ sections whose questions are visible on the page (`faqPage`).
- Any time you'd write `dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}`: that pattern is unsafe if any value contains `</script>`.

## When NOT to use

- Facts that aren't on the page or aren't true (fake reviews, made-up ratings, an address you don't trade from). Google penalises the whole site.
- Breadcrumbs, products, events and other types not built here. Write the node by hand and render it with `<JsonLd>`.
- Page metadata (`<title>`, Open Graph). Use `@damon/seo`.

## API

| Export | Signature | Notes |
|---|---|---|
| `JsonLd` | `({ data }) => <script>` | Server component. |
| `serializeJsonLd` | `(data: unknown) => string` | Escapes `<` `>` `&` and U+2028/2029; drops `undefined`. |
| `jsonLdGraph` | `(...nodes) => { "@context", "@graph" }` | Falsy nodes are skipped. |
| `organization` | `({ siteUrl, name, logo?, email?, telephone?, description?, address?, sameAs?, type? }) => node` | `@id` `<origin>/#organization`. `type` can be `"LocalBusiness"` or `["Organization", "ProfessionalService"]`. |
| `website` | `({ siteUrl, name, description?, inLanguage? }) => node` | `@id` `<origin>/#website`, publisher → organization. |
| `service` | `({ siteUrl, path, name, description, areaServed?, serviceType? }) => node` | `@id` `<page>#service`, provider → organization. |
| `article` | `({ siteUrl, path, headline, datePublished, description?, dateModified?, images?, authors?, section?, keywords?, type? }) => node` | Authors default to the organization. |
| `faqPage` | `(items: { question, answer }[]) => node \| null` | `null` when no complete pairs. |
| `nodeId`, `absoluteUrl`, `siteOrigin` | helpers | |

## Minimal example

```tsx
// app/layout.tsx
import { JsonLd, jsonLdGraph, organization, website } from "@/lib/json-ld"

const SITE = "https://kaurijoinery.co.nz"

<body>
  {children}
  <JsonLd data={jsonLdGraph(organization({ siteUrl: SITE, name: "Kauri Joinery", logo: "/logo.png" }), website({ siteUrl: SITE, name: "Kauri Joinery", inLanguage: "en-NZ" }))} />
</body>
```

## Real example

A blog post with a visible FAQ section:

```tsx
// app/blog/[slug]/page.tsx
import { article, faqPage, JsonLd, jsonLdGraph } from "@/lib/json-ld"

export default async function Post({ params }: PageProps<"/blog/[slug]">) {
  const post = await getPost((await params).slug)
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
      <FaqList items={post.faq} />
      <JsonLd
        data={jsonLdGraph(
          article({
            siteUrl: SITE,
            path: `/blog/${post.slug}`,
            headline: post.title,
            description: post.excerpt,
            images: post.cover ? [post.cover.url] : undefined,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            authors: post.author ? [post.author.name] : undefined,
            keywords: post.tags,
          }),
          faqPage(post.faq)
        )}
      />
    </article>
  )
}
```

## Constraints

- `@id`s are origin-based and locale-independent: nine translations of a site describe one organisation, not nine.
- Paths are resolved against the origin of `siteUrl`; any path in `siteUrl` is ignored.
- Only mark up FAQ answers that are visible on the page, word for word.
- Validate with Google's Rich Results Test after changes. Builders don't check schema.org rules beyond required fields.
