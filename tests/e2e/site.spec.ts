import { expect, test } from "@playwright/test"

import registry from "../../registry.json" with { type: "json" }

test("home lists every registry item", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1, name: "damon-ui" })).toBeVisible()
  for (const item of registry.items) {
    await expect(page.locator(`a[href="/docs/${item.name}"]`).first()).toBeVisible()
  }
})

for (const item of registry.items) {
  test(`docs page renders: ${item.name}`, async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))
    await page.goto(`/docs/${item.name}`)
    // Demos may render their own h1 (page-header), so scope to the article header.
    await expect(page.locator("article > header h1")).toBeVisible()
    await expect(page.getByText(`npx shadcn add @damon/${item.name}`).first()).toBeVisible()
    await expect(page.getByRole("heading", { name: "When NOT to use" })).toBeVisible()
    expect(errors).toEqual([])
  })
}

test("registry and llms endpoints are served", async ({ request }) => {
  for (const path of ["/r/registry.json", "/llms.txt", "/llms-full.txt", ...registry.items.map((i) => `/r/${i.name}.json`)]) {
    const res = await request.get(path)
    expect(res.status(), path).toBe(200)
  }
})
