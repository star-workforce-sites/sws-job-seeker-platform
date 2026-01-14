import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
  test("should load homepage with correct branding", async ({ page }) => {
    await page.goto("/")

    // Check title
    await expect(page).toHaveTitle(/STAR Workforce Solutions/)

    // Check hero section
    await expect(page.locator("h1")).toContainText("Land Your Next Consulting or Contract Role")

    // Check for disclaimer
    await expect(page.locator("text=Consulting & Contract Services Only")).toBeVisible()

    // Check CTA buttons
    await expect(page.getByRole("link", { name: "Start Free Trial" })).toBeVisible()
    await expect(page.getByRole("link", { name: "View Pricing" })).toBeVisible()
  })

  test("should display feature cards", async ({ page }) => {
    await page.goto("/")

    // Check for key features
    await expect(page.locator("text=Resume Distribution")).toBeVisible()
    await expect(page.locator("text=ATS Optimization")).toBeVisible()
    await expect(page.locator("text=Recruiter Network")).toBeVisible()
  })

  test("should have working navigation", async ({ page }) => {
    await page.goto("/")

    // Test navigation links
    const servicesLink = page.getByRole("link", { name: "Services" })
    await expect(servicesLink).toBeVisible()
    await servicesLink.click()
    await expect(page).toHaveURL(/services/)
  })

  test("should be mobile responsive", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto("/")

    // Check mobile menu exists
    await expect(page.locator("nav")).toBeVisible()

    // Check hero text is visible on mobile
    await expect(page.locator("h1")).toBeVisible()
  })
})
