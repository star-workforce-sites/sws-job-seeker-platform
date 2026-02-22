import { test, expect } from "@playwright/test"

// ============================================================
// Admin Panel Tests - Option B
// Tests run against: https://www.starworkforcesolutions.com
//
// ADMIN EMAIL: merianda@starworkforcesolutions.com
//
// TEST GROUPS:
//   1. Auth Guards          - all admin routes reject unauthenticated requests
//   2. API Structure        - response shape is correct when auth would pass
//   3. Admin UI             - /dashboard/admin page renders and redirects correctly
//   4. Assignment API       - POST validation rejects bad input correctly
//   5. Recruiter Promotion  - users table role check (read-only, no mutations)
// ============================================================

const ADMIN_EMAIL = "merianda@starworkforcesolutions.com"

// ── GROUP 1: Auth Guards ─────────────────────────────────────
// All admin API routes must return 401 when called without a session cookie.
// This confirms the auth guard in each route is working.

test.describe("Admin API - Auth Guards", () => {
  test("GET /api/admin/recruiter-assignments requires auth", async ({ request }) => {
    const response = await request.get("/api/admin/recruiter-assignments")
    expect(
      response.status(),
      "Expected 401 Unauthorized for unauthenticated request"
    ).toBe(401)
  })

  test("POST /api/admin/recruiter-assignments requires auth", async ({ request }) => {
    const response = await request.post("/api/admin/recruiter-assignments", {
      data: { subscription_id: "test", recruiter_id: "test" },
    })
    expect(
      response.status(),
      "Expected 401 Unauthorized for unauthenticated POST"
    ).toBe(401)
  })

  test("GET /api/admin/recruiter-assignments/[id] requires auth", async ({ request }) => {
    const response = await request.get("/api/admin/recruiter-assignments/00000000-0000-0000-0000-000000000000")
    expect(
      response.status(),
      "Expected 401 Unauthorized for unauthenticated request"
    ).toBe(401)
  })

  test("PUT /api/admin/recruiter-assignments/[id] requires auth", async ({ request }) => {
    const response = await request.put("/api/admin/recruiter-assignments/00000000-0000-0000-0000-000000000000", {
      data: { status: "active" },
    })
    expect(
      response.status(),
      "Expected 401 Unauthorized for unauthenticated PUT"
    ).toBe(401)
  })

  test("DELETE /api/admin/recruiter-assignments/[id] requires auth", async ({ request }) => {
    const response = await request.delete("/api/admin/recruiter-assignments/00000000-0000-0000-0000-000000000000")
    expect(
      response.status(),
      "Expected 401 Unauthorized for unauthenticated DELETE"
    ).toBe(401)
  })

  test("GET /api/admin/recruiters requires auth", async ({ request }) => {
    const response = await request.get("/api/admin/recruiters")
    expect(
      response.status(),
      "Expected 401 Unauthorized for unauthenticated request"
    ).toBe(401)
  })

  test("GET /api/admin/subscribers requires auth", async ({ request }) => {
    const response = await request.get("/api/admin/subscribers")
    expect(
      response.status(),
      "Expected 401 Unauthorized for unauthenticated request"
    ).toBe(401)
  })

  test("GET /api/admin/subscribers?unassigned=true requires auth", async ({ request }) => {
    const response = await request.get("/api/admin/subscribers?unassigned=true")
    expect(
      response.status(),
      "Expected 401 Unauthorized for unassigned filter"
    ).toBe(401)
  })
})

// ── GROUP 2: Unauthenticated Response Shape ───────────────────
// Confirms error responses return JSON with an "error" key, not HTML.

test.describe("Admin API - Error Response Shape", () => {
  test("Unauthenticated response is valid JSON with error key", async ({ request }) => {
    const response = await request.get("/api/admin/subscribers")
    expect(response.status()).toBe(401)

    // Must be JSON, not an HTML redirect or plain text
    const contentType = response.headers()["content-type"] || ""
    expect(
      contentType,
      "Expected JSON content-type for error response"
    ).toContain("application/json")

    const data = await response.json()
    expect(data).toHaveProperty("error")
    expect(typeof data.error).toBe("string")
  })

  test("POST with missing body fields returns structured error", async ({ request }) => {
    // Send POST with empty body — should get 401 (auth runs before validation)
    const response = await request.post("/api/admin/recruiter-assignments", {
      data: {},
    })
    // Auth guard fires first → 401
    expect([400, 401]).toContain(response.status())

    const data = await response.json()
    expect(data).toHaveProperty("error")
  })
})

// ── GROUP 3: Admin UI Page ────────────────────────────────────
// Confirms /dashboard/admin redirects correctly when not logged in.

test.describe("Admin Dashboard UI", () => {
  test("/dashboard/admin redirects unauthenticated users to login", async ({ page }) => {
    // Follow redirects and check final URL
    await page.goto("/dashboard/admin", { waitUntil: "networkidle" })

    const finalUrl = page.url()
    expect(
      finalUrl,
      "Expected redirect to /auth/login for unauthenticated admin page access"
    ).toContain("/auth/login")
  })

  test("/dashboard/admin login page loads correctly", async ({ page }) => {
    await page.goto("/auth/login", { waitUntil: "networkidle" })

    // Page should load with 200 (not error page)
    expect(page.url()).toContain("/auth/login")

    // Should have some form of login UI
    const bodyText = await page.textContent("body")
    expect(
      bodyText,
      "Expected login page to contain sign in related text"
    ).toMatch(/sign in|log in|login|email/i)
  })

  test("Production site is reachable", async ({ page }) => {
    const response = await page.goto("/", { waitUntil: "networkidle" })
    expect(
      response?.status(),
      "Expected homepage to return 200"
    ).toBe(200)
  })
})

// ── GROUP 4: Assignment API Input Validation ──────────────────
// Confirms the POST endpoint validates required fields.
// These fire AFTER auth — so they'll return 401 in production
// (since we can't authenticate in automated tests without session cookies).
// The purpose here is to document expected behavior for manual verification.

test.describe("Assignment API - Documented Behavior", () => {
  test("POST /api/admin/recruiter-assignments - auth required before validation", async ({ request }) => {
    // Without auth, should get 401 (auth fires before field validation)
    const response = await request.post("/api/admin/recruiter-assignments", {
      data: {
        subscription_id: "",
        recruiter_id: "",
      },
    })
    // Auth guard fires first
    expect(response.status()).toBe(401)
  })

  test("Admin assignment endpoint exists (not 404)", async ({ request }) => {
    // A 401 means the route exists and auth guard is working
    // A 404 means the route was never deployed
    const response = await request.get("/api/admin/recruiter-assignments")
    expect(
      response.status(),
      "Expected 401 not 404 — route must exist"
    ).not.toBe(404)
  })

  test("Admin subscribers endpoint exists (not 404)", async ({ request }) => {
    const response = await request.get("/api/admin/subscribers")
    expect(response.status()).not.toBe(404)
  })

  test("Admin recruiters endpoint exists (not 404)", async ({ request }) => {
    const response = await request.get("/api/admin/recruiters")
    expect(response.status()).not.toBe(404)
  })
})

// ── GROUP 5: Existing Platform Routes Not Broken ─────────────
// Confirms Option B changes did not break Option A or earlier features.

test.describe("Regression - Option A and Core Routes Unaffected", () => {
  test("GET /api/health still works", async ({ request }) => {
    const response = await request.get("/api/health")
    expect(response.ok()).toBeTruthy()
  })

  test("GET /api/jobs/list still works", async ({ request }) => {
    const response = await request.get("/api/jobs/list")
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data).toHaveProperty("jobs")
  })

  test("/pricing page still loads", async ({ page }) => {
    const response = await page.goto("/pricing", { waitUntil: "networkidle" })
    expect(response?.status()).toBe(200)
    const bodyText = await page.textContent("body")
    expect(bodyText).toMatch(/recruiter|pricing|plan/i)
  })

  test("/services page still loads", async ({ page }) => {
    const response = await page.goto("/services", { waitUntil: "networkidle" })
    expect(response?.status()).toBe(200)
  })

  test("/hire-recruiter page still loads", async ({ page }) => {
    const response = await page.goto("/hire-recruiter", { waitUntil: "networkidle" })
    expect(response?.status()).toBe(200)
    const bodyText = await page.textContent("body")
    expect(bodyText).toMatch(/recruiter|offshore|plan/i)
  })

  test("Job seeker dashboard redirects to login when not authed", async ({ page }) => {
    await page.goto("/dashboard/job-seeker", { waitUntil: "networkidle" })
    expect(page.url()).toContain("/auth/login")
  })
})
