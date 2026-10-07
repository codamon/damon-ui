import { expect, test } from "@playwright/test"

import registry from "../../registry.json" with { type: "json" }

// Visual regression for every item that renders UI. Light and dark per demo.
const visual = registry.items.filter((item) =>
  ["registry:ui", "registry:block", "registry:theme"].includes(item.type)
)

for (const item of visual) {
  for (const mode of ["light", "dark"] as const) {
    test(`screenshot: ${item.name} (${mode})`, async ({ page }) => {
      await page.addInitScript((m) => localStorage.setItem("theme", m), mode)
      await page.emulateMedia({ reducedMotion: "reduce" })
      await page.goto(`/docs/${item.name}`)
      // The sticky site header would overlap tall element screenshots.
      await page.addStyleTag({ content: "[data-site-header]{position:static!important}" })
      const demo = page.locator(`[data-demo="${item.name}"]`)
      await demo.scrollIntoViewIfNeeded()
      await page.evaluate(() => document.fonts.ready)
      await expect(demo).toHaveScreenshot(`${item.name}-${mode}.png`)
    })
  }
}
