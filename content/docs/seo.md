# SEO metadata

Next.js `Metadata` builders bound to your site config: `seo.page()`, `seo.article()` and `seo.root()` give every page the same canonical, Open Graph, Twitter card and hreflang shape. Also exports `truncate`, `plainText` and `hreflangAlternates`.

```bash
npx shadcn add @damon/seo
```

Installs `lib/seo.ts`. Uses `next`'s `Metadata` type; no other dependencies.

## When to use

- Every Next.js App Router site, so pages stop hand-writing `openGraph` objects that drift apart.
- Pages with share images, blog posts (`article`), and multi-language sites (`languages` + `hreflangAlternates`).
- Building descriptions from CMS content (`truncate(plainText(body))`).

## When NOT to use

- Structured data. Use `@damon/json-ld`.
- Sitemaps and robots.txt. Use Next's `sitemap.ts` / `robots.ts` file conventions.
- Pages Router projects (`next/head`).

## API

`createSeo(config)` → `{ page, article, root, absoluteUrl }`

`config`: `{ siteName, siteUrl, locale? = "en_NZ", defaultImage?: { url, width?, height?, alt? }, twitterSite?, titleSeparator? = " | " }`

| Method | Input | Returns |
|---|---|---|
| `page` | `{ title, description, path, absoluteTitle?, image? (null = none), noindex?, languages? }` | `Metadata` with `metadataBase`, canonical, OG (`website`), Twitter (`summary_large_image` when there's an image), `robots` when `noindex`. |
| `article` | `page` input + `{ publishedTime, modifiedTime?, authors?, section?, tags? }` | OG type `article` with times, authors, tags; `keywords` from tags. |
| `root` | `{ description, titleTemplate? }` | Root-layout defaults: `title.template` = `%s \| siteName`, site-wide OG. |
| `absoluteUrl` | `(path) => string` | |

Helpers:

| Function | Example |
|---|---|
| `truncate(text, max = 160)` | Cuts on a word boundary and adds "…". |
| `plainText(markdownOrHtml)` | Strips tags, links, images, headings, emphasis. |
| `hreflangAlternates(path, prefixes, defaultLanguage)` | `("/pricing", { "en-NZ": "", "zh-CN": "/zh" }, "en-NZ")` → `{ "en-NZ": "/pricing", "zh-CN": "/zh/pricing", "x-default": "/pricing" }` |

## Minimal example

```ts
// lib/site-seo.ts
import { createSeo } from "@/lib/seo"
export const seo = createSeo({ siteName: "Kauri Joinery", siteUrl: "https://kaurijoinery.co.nz", defaultImage: { url: "/og.png", width: 1200, height: 630 } })

// app/kitchens/page.tsx
export const metadata = seo.page({ title: "Kitchens", description: "Custom kitchens made in Auckland.", path: "/kitchens" })
```

## Real example

Root layout plus a CMS-driven article with a description from the body:

```ts
// app/layout.tsx
import { seo } from "@/lib/site-seo"
export const metadata = seo.root({ description: "Kitchens, wardrobes and stairs made in Auckland from native timber." })

// app/blog/[slug]/page.tsx
import { plainText, truncate } from "@/lib/seo"
import { seo } from "@/lib/site-seo"

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const post = await getPost((await params).slug)
  return seo.article({
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? truncate(plainText(post.body)),
    path: `/blog/${post.slug}`,
    image: post.cover ? { url: post.cover.url, width: post.cover.width, height: post.cover.height, alt: post.cover.alt } : undefined,
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: post.author ? [post.author.name] : undefined,
    tags: post.tags,
  })
}
```

## Constraints

- Each language version must list all others plus itself in `languages`, or search engines ignore the cluster. Use `hreflangAlternates` to build it the same way everywhere.
- Don't add `languages` when only the chrome is translated and the content is identical (e.g. a single-language blog inside a translated site). Point every copy's canonical at one path instead.
- `page()` sets `metadataBase`, so relative image URLs resolve per deployment (staging shares staging images).
- Social titles get the site name appended; the `<title>` gets it through the root template. Use `absoluteTitle` for the home page.
