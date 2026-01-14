import { test, expect } from "@playwright/test"

test.describe("Contact Form", () => {
  test("should display contact form", async ({ page }) => {
    await page.goto("/contact")

    await expect(page.locator("h1")).toContainText("Get in Touch")
    await expect(page.getByLabel("Name")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Subject")).toBeVisible()
    await expect(page.getByLabel("Message")).toBeVisible()
  })

  test("should auto-fill subject from query parameter", async ({ page }) => {
    await page.goto("/contact?subject=ATS Optimization Request")

    const subjectSelect = page.getByLabel("Subject")
    await expect(subjectSelect).toHaveValue("ATS Optimization Request")
  })

  test("should validate required fields", async ({ page }) => {
    await page.goto("/contact")

    const submitButton = page.getByRole("button", { name: "Send Message" })
    await submitButton.click()

    // Check for HTML5 validation or error messages
    const nameInput = page.getByLabel("Name")
    await expect(nameInput).toBeFocused()
  })

  test("should submit contact form", async ({ page }) => {
    await page.goto("/contact")

    await page.getByLabel("Name").fill("Test User")
    await page.getByLabel("Email").fill("test@example.com")
    await page.getByLabel("Subject").selectOption("General Support Request")
    await page.getByLabel("Message").fill("This is a test message")

    await page.getByRole("button", { name: "Send Message" }).click()

    // Wait for success message
    await expect(page.getByText("Message sent successfully")).toBeVisible({ timeout: 5000 })
  })
})
