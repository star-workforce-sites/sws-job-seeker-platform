import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/session"
import { sql } from "@vercel/postgres"

// GET /api/jobs/employer/list
// Returns employer's own jobs (active and inactive)

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole("employer")

    const result = await sql`
      SELECT * FROM jobs
      WHERE "employerId" = ${user.id}
      ORDER BY "createdAt" DESC
    `

    return NextResponse.json({ jobs: result.rows })
  } catch (error: any) {
    console.error("[v0] Error fetching employer jobs:", error)

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}
