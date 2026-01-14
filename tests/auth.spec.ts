import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/auth/login")

    await expect(page.locator("h1")).toContainText("Welcome Back")
    await expect(page.getByText("Continue with Google")).toBeVisible()
    await expect(page.getByText("Continue with LinkedIn")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
  })

  test("should show email input for magic link", async ({ page }) => {
    await page.goto("/auth/login")

    const emailInput = page.getByLabel("Email")
    await emailInput.fill("test@example.com")

    const sendButton = page.getByRole("button", { name: "Send Magic Link" })
    await expect(sendButton).toBeEnabled()
  })

  test("should navigate to signup page", async ({ page }) => {
    await page.goto("/auth/login")

    const signupLink = page.getByRole("link", { name: "Sign up" })
    await signupLink.click()
    await expect(page).toHaveURL(/auth\/signup/)
  })

  test("should redirect to dashboard after login (mock)", async ({ page }) => {
    // Note: This test requires mocking auth or test credentials
    await page.goto("/auth/login")

    // In production, you would:
    // 1. Use test credentials
    // 2. Mock OAuth responses
    // 3. Verify redirect to /dashboard
  })
})
