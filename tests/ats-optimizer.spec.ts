import { test, expect } from "@playwright/test"

test.describe("ATS Optimizer", () => {
  test("should display ATS optimizer page", async ({ page }) => {
    await page.goto("/tools/ats-optimizer")

    await expect(page.locator("h1")).toContainText("ATS Optimizer")
    await expect(page.getByText("Free AI-Powered ATS Analysis")).toBeVisible()
  })

  test("should have resume upload component", async ({ page }) => {
    await page.goto("/tools/ats-optimizer")

    // Check for upload area
    await expect(page.getByText("Click to upload")).toBeVisible()
    await expect(page.getByText("PDF or DOCX")).toBeVisible()
  })

  test("should display premium features for paid users", async ({ page }) => {
    // Set premium cookie
    await page.context().addCookies([
      {
        name: "atsPremium",
        value: "true",
        domain: "localhost",
        path: "/",
      },
    ])

    await page.goto("/tools/ats-optimizer")

    // Check for premium features
    await expect(page.getByText("Full ATS Analysis")).toBeVisible()
  })

  test("should show upgrade CTA for free users", async ({ page }) => {
    await page.goto("/tools/ats-optimizer")

    // Check for upgrade button
    await expect(page.getByText("Unlock Full Analysis")).toBeVisible()
  })
})
