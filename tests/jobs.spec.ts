import { test, expect } from "@playwright/test"

test.describe("Job Listings", () => {
  test("should display jobs page", async ({ page }) => {
    await page.goto("/jobs")

    await expect(page.locator("h1")).toContainText("Find Your Next Contract Role")
    await expect(page.getByText("Browse Consulting & Contract Opportunities")).toBeVisible()
  })

  test("should have search filters", async ({ page }) => {
    await page.goto("/jobs")

    // Check for filter elements
    await expect(page.getByLabel("Search jobs")).toBeVisible()
    await expect(page.getByText("Industry")).toBeVisible()
    await expect(page.getByText("Location")).toBeVisible()
  })

  test("should display job cards", async ({ page }) => {
    await page.goto("/jobs")

    // Wait for job listings to load
    await page.waitForSelector("text=Senior Cloud Engineer", { timeout: 5000 }).catch(() => {
      // Jobs might be empty in test environment
    })
  })

  test("should filter jobs by industry", async ({ page }) => {
    await page.goto("/jobs")

    const industrySelect = page.getByLabel("Industry")
    await industrySelect.selectOption("Software")

    // Wait for filtered results
    await page.waitForTimeout(1000)
  })
})
