import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/session"
import { sql } from "@vercel/postgres"

// POST /api/jobs/[id]/deactivate
// Deactivates a job posting (employers only, own jobs only)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireRole("employer")
    const jobId = params.id

    // Verify job belongs to employer
    const result = await sql`
      UPDATE jobs
      SET "isActive" = FALSE
      WHERE id = ${jobId} AND "employerId" = ${user.id}
      RETURNING *
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      job: result.rows[0],
    })
  } catch (error: any) {
    console.error("[v0] Error deactivating job:", error)

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ error: "Failed to deactivate job" }, { status: 500 })
  }
}
