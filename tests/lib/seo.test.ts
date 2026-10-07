import { describe, expect, it } from "vitest"

import { createSeo, hreflangAlternates, plainText, truncate } from "@/registry/damon/lib/seo"

const seo = createSeo({
  siteName: "Kauri Joinery",
  siteUrl: "https://kaurijoinery.co.nz",
  defaultImage: { url: "/og.png", width: 1200, height: 630, alt: "Kauri Joinery" },
  twitterSite: "@kaurijoinery",
})

describe("createSeo().page", () => {
  it("builds canonical, Open Graph and Twitter from one input", () => {
    const meta = seo.page({ title: "Kitchens", description: "Custom kitchens in Auckland.", path: "/kitchens" })
    expect(meta.title).toBe("Kitchens")
    expect(meta.metadataBase?.toString()).toBe("https://kaurijoinery.co.nz/")
    expect(meta.alternates).toEqual({ canonical: "/kitchens" })
    expect(meta.openGraph).toMatchObject({
      type: "website",
      locale: "en_NZ",
      url: "https://kaurijoinery.co.nz/kitchens",
      siteName: "Kauri Joinery",
      title: "Kitchens | Kauri Joinery",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "Kauri Joinery" }],
    })
    expect(meta.twitter).toMatchObject({ card: "summary_large_image", site: "@kaurijoinery", images: ["/og.png"] })
    expect(meta.robots).toBeUndefined()
  })

  it("supports absolute titles, no image, noindex and languages", () => {
    const meta = seo.page({
      title: "Kauri Joinery — Auckland",
      description: "d",
      path: "/",
      absoluteTitle: true,
      image: null,
      noindex: true,
      languages: { "en-NZ": "/", "zh-CN": "/zh" },
    })
    expect(meta.title).toEqual({ absolute: "Kauri Joinery — Auckland" })
    expect(meta.openGraph).toMatchObject({ title: "Kauri Joinery — Auckland" })
    expect(meta.openGraph).not.toHaveProperty("images")
    expect(meta.twitter).toMatchObject({ card: "summary" })
    expect(meta.robots).toEqual({ index: false, follow: true })
    expect(meta.alternates).toEqual({ canonical: "/", languages: { "en-NZ": "/", "zh-CN": "/zh" } })
  })
})

describe("createSeo().article and root", () => {
  it("adds article fields", () => {
    const meta = seo.article({
      title: "Caring for rimu",
      description: "d",
      path: "/blog/rimu",
      publishedTime: "2026-10-01",
      authors: ["Aroha"],
      tags: ["rimu"],
    })
    expect(meta.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-10-01",
      modifiedTime: "2026-10-01",
      authors: ["Aroha"],
      tags: ["rimu"],
    })
    expect(meta.keywords).toEqual(["rimu"])
  })

  it("root sets the title template", () => {
    const meta = seo.root({ description: "Joinery" })
    expect(meta.title).toEqual({ default: "Kauri Joinery", template: "%s | Kauri Joinery" })
    expect(seo.absoluteUrl("/a?b=1")).toBe("https://kaurijoinery.co.nz/a?b=1")
  })
})

describe("text helpers", () => {
  it("plainText strips markdown and html", () => {
    expect(plainText("## Hello **world**\n\n- see [docs](/d) <b>now</b>")).toBe("Hello world see docs now")
    expect(plainText("![alt text](/x.png) `code`")).toBe("alt text code")
  })

  it("truncate cuts on a word boundary", () => {
    expect(truncate("short")).toBe("short")
    const long = "Custom kitchens, wardrobes and staircases made in Auckland from native timbers, finished by hand and installed by our own team across the region since 1998."
    const out = truncate(long, 100)
    expect(out.length).toBeLessThanOrEqual(100)
    expect(out.endsWith("…")).toBe(true)
    expect(out).not.toMatch(/\s…$/)
    expect(truncate("a".repeat(200), 50)).toHaveLength(50)
  })

  it("hreflangAlternates lists every language and x-default", () => {
    expect(hreflangAlternates("/pricing", { "en-NZ": "", "zh-CN": "/zh", "ja": "/ja/" }, "en-NZ")).toEqual({
      "en-NZ": "/pricing",
      "zh-CN": "/zh/pricing",
      ja: "/ja/pricing",
      "x-default": "/pricing",
    })
    expect(hreflangAlternates("/", { en: "", zh: "/zh" }, "en")).toEqual({ en: "/", zh: "/zh", "x-default": "/" })
  })
})
