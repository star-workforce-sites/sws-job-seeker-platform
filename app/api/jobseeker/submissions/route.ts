import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"

// ── GET /api/jobseeker/submissions ────────────────────────────
// Returns all application_tracking rows for the logged-in job seeker
// Auth: must be logged in as jobseeker
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Look up user by email
    const userResult = await sql`
      SELECT id, role FROM users WHERE email = ${session.user.email}
    `
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const user = userResult.rows[0]

    // Recruiters and admins should not use this endpoint
    if (user.role === "recruiter" || user.role === "admin") {
      return NextResponse.json(
        { error: "This endpoint is for job seekers only" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 200)

    const result = await sql`
      SELECT
        at.id,
        at.job_title,
        at.company_name,
        at.job_url,
        at.status,
        at.application_date,
        at.submitted_at,
        at.feedback_received,
        at.feedback_date,
        at.feedback_notes,
        at.notes,
        at.updated_at,
        u.name  AS recruiter_name,
        u.email AS recruiter_email
      FROM application_tracking at
      JOIN users u ON u.id = at.recruiter_id
      WHERE at.client_id = ${user.id}
      ORDER BY at.submitted_at DESC
      LIMIT ${limit}
    `

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      submissions: result.rows,
    })
  } catch (error: any) {
    console.error("[jobseeker/submissions GET]", error?.message ?? error)
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    )
  }
}
