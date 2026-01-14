import { test, expect } from "@playwright/test"

test.describe("API Endpoints", () => {
  test("GET /api/health should return healthy status", async ({ request }) => {
    const response = await request.get("/api/health")
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.status).toBe("healthy")
    expect(data.services.api).toBe("running")
  })

  test("GET /api/jobs/list should return jobs", async ({ request }) => {
    const response = await request.get("/api/jobs/list")
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty("jobs")
    expect(Array.isArray(data.jobs)).toBeTruthy()
  })

  test("POST /api/contact should accept contact form", async ({ request }) => {
    const response = await request.post("/api/contact", {
      data: {
        name: "Test User",
        email: "test@example.com",
        subject: "Test",
        message: "Test message",
      },
    })

    expect(response.ok()).toBeTruthy()
  })

  test("Protected endpoints should require authentication", async ({ request }) => {
    const response = await request.get("/api/user/profile")
    expect(response.status()).toBe(401)
  })
})
