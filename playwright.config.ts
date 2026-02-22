import { defineConfig, devices } from "@playwright/test"

// When NEXT_PUBLIC_URL is set to production URL, tests run against production.
// When not set, falls back to localhost:3000 for local dev.
const BASE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
const IS_PRODUCTION = BASE_URL.includes("starworkforcesolutions.com")

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Give production more time to respond
    actionTimeout: IS_PRODUCTION ? 15000 : 10000,
    navigationTimeout: IS_PRODUCTION ? 20000 : 15000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  // Only start dev server when NOT running against production
  ...(IS_PRODUCTION
    ? {}
    : {
        webServer: {
          command: "npm run dev",
          url: "http://localhost:3000",
          reuseExistingServer: !process.env.CI,
        },
      }),
})
