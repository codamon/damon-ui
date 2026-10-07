import type { Metadata } from "next"

/**
 * Next.js `Metadata` builders bound to one site's config, so every page gets
 * the same canonical, Open Graph, Twitter and hreflang shape.
 *
 * ```ts
 * // lib/site-seo.ts
 * export const seo = createSeo({ siteName: "Kauri Joinery", siteUrl: "https://kaurijoinery.co.nz" })
 * // app/about/page.tsx
 * export const metadata = seo.page({ title: "About", description: "…", path: "/about" })
 * ```
 */

export interface ShareImage {
  /** Path or absolute URL. Relative paths resolve against `metadataBase`. */
  url: string
  width?: number
  height?: number
  alt?: string
}

export interface SeoConfig {
  siteName: string
  siteUrl: string | URL
  /** Open Graph locale. Default `"en_NZ"`. */
  locale?: string
  /** Used when a page has no image of its own. 1200×630 recommended. */
  defaultImage?: ShareImage
  /** `@handle` for `twitter:site`. */
  twitterSite?: string
  /** Separator for social titles: `"About | Kauri Joinery"`. Default `" | "`. */
  titleSeparator?: string
}

export interface PageSeo {
  title: string
  description: string
  /** Canonical path, e.g. `"/services/kitchens"`. */
  path: string
  /** `true` for the home page or when the title already contains the brand. */
  absoluteTitle?: boolean
  image?: ShareImage | null
  /** Ask search engines not to index (thank-you pages, drafts). */
  noindex?: boolean
  /** hreflang → path for every language version, including this one. See `hreflangAlternates`. */
  languages?: Record<string, string>
}

export interface ArticleSeo extends PageSeo {
  publishedTime: string
  modifiedTime?: string
  authors?: string[]
  section?: string
  tags?: string[]
}

/**
 * Strip markdown/HTML and collapse whitespace, for building descriptions
 * from content.
 */
export function plainText(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[`*_~]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Shorten to at most `max` characters on a word boundary, adding "…".
 * Search results cut descriptions at roughly 155–160 characters.
 */
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(" ")
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–—-]+$/, "")}…`
}

/**
 * hreflang cluster for one page. Every language version must list all the
 * others (and itself) or search engines ignore the group.
 *
 * @example
 * hreflangAlternates("/pricing", { "en-NZ": "", "zh-CN": "/zh" }, "en-NZ")
 * // { "en-NZ": "/pricing", "zh-CN": "/zh/pricing", "x-default": "/pricing" }
 */
export function hreflangAlternates(
  path: string,
  prefixes: Record<string, string>,
  defaultLanguage: string
): Record<string, string> {
  const join = (prefix: string) => {
    const p = `${prefix.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`
    return p.length > 1 ? p.replace(/\/$/, "") : p
  }
  const languages: Record<string, string> = {}
  for (const [lang, prefix] of Object.entries(prefixes)) languages[lang] = join(prefix)
  if (defaultLanguage in prefixes) languages["x-default"] = join(prefixes[defaultLanguage])
  return languages
}

export function createSeo(config: SeoConfig) {
  const { siteName, locale = "en_NZ", defaultImage, twitterSite, titleSeparator = " | " } = config
  const base = new URL(config.siteUrl)

  const absoluteUrl = (pathOrUrl: string) => new URL(pathOrUrl, base).toString()
  const socialTitle = (title: string, absolute?: boolean) => (absolute ? title : `${title}${titleSeparator}${siteName}`)

  function page(input: PageSeo, type: "website" | "article" = "website"): Metadata {
    const image = input.image === null ? undefined : (input.image ?? defaultImage)
    const fullTitle = socialTitle(input.title, input.absoluteTitle)
    return {
      metadataBase: base,
      title: input.absoluteTitle ? { absolute: input.title } : input.title,
      description: input.description,
      alternates: {
        canonical: input.path,
        ...(input.languages ? { languages: input.languages } : {}),
      },
      openGraph: {
        type,
        locale,
        url: absoluteUrl(input.path),
        siteName,
        title: fullTitle,
        description: input.description,
        ...(image ? { images: [image] } : {}),
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title: fullTitle,
        description: input.description,
        ...(twitterSite ? { site: twitterSite } : {}),
        ...(image ? { images: [image.url] } : {}),
      },
      ...(input.noindex ? { robots: { index: false, follow: true } } : {}),
    }
  }

  function article(input: ArticleSeo): Metadata {
    const meta = page(input, "article")
    return {
      ...meta,
      ...(input.tags?.length ? { keywords: input.tags } : {}),
      openGraph: {
        ...meta.openGraph,
        type: "article",
        publishedTime: input.publishedTime,
        modifiedTime: input.modifiedTime ?? input.publishedTime,
        ...(input.authors?.length ? { authors: input.authors } : {}),
        ...(input.section ? { section: input.section } : {}),
        ...(input.tags?.length ? { tags: input.tags } : {}),
      },
    }
  }

  /** Root layout defaults: `metadataBase`, title template, site-wide OG. */
  function root(input: { description: string; titleTemplate?: string }): Metadata {
    return {
      metadataBase: base,
      title: { default: siteName, template: input.titleTemplate ?? `%s${titleSeparator}${siteName}` },
      description: input.description,
      openGraph: {
        type: "website",
        locale,
        siteName,
        url: absoluteUrl("/"),
        ...(defaultImage ? { images: [defaultImage] } : {}),
      },
      twitter: { card: defaultImage ? "summary_large_image" : "summary", ...(twitterSite ? { site: twitterSite } : {}) },
    }
  }

  return { page: (input: PageSeo) => page(input), article, root, absoluteUrl }
}
