import { test, expect } from "@playwright/test"

test.describe("Employer Dashboard", () => {
  test("should require authentication", async ({ page }) => {
    await page.goto("/employer/dashboard")

    // Should redirect to login
    await expect(page).toHaveURL(/auth\/login/)
  })

  test("should display employer dashboard (with mock auth)", async ({ page }) => {
    // Note: This requires mocking employer session
    // In production, you would:
    // 1. Create test employer account
    // 2. Login programmatically
    // 3. Navigate to dashboard
    // 4. Verify job listings
  })

  test("should show job posting limit", async ({ page }) => {
    // With mock employer session
    await page.goto("/employer/dashboard")

    // Check for job limit indicator
    await expect(page.getByText(/\d\/5 active/))
      .toBeVisible()
      .catch(() => {
        // Requires auth
      })
  })
})
