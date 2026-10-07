import nextEnv from "@next/env"
import { defineConfig, devices } from "@playwright/test"

// Same .env.local as Next (PLAYWRIGHT_BASE_URL, ALLOWED_DEV_ORIGINS).
nextEnv.loadEnvConfig(process.cwd())

// Fixed project port 3350. Reuses a running `pnpm dev`; otherwise serves the static export.
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3350"

export default defineConfig({
  testDir: "tests/e2e",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } }],
  webServer: {
    command: "npx serve out -l 3350 --no-clipboard",
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
