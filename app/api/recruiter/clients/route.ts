import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"

// ── Auth guard: recruiter only ────────────────────────────────
async function requireRecruiter() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 }
  }
  const result = await sql`
    SELECT id, name, email, role
    FROM users
    WHERE email = ${session.user.email}
  `
  if (!result.rows[0]) {
    return { error: "User not found", status: 401 }
  }
  if (result.rows[0].role !== "recruiter") {
    return { error: "Forbidden - Recruiter access required", status: 403 }
  }
  return { recruiter: result.rows[0] }
}

// ── GET /api/recruiter/clients ────────────────────────────────
// Returns all job seekers currently assigned to this recruiter
// with their subscription plan and submission counts
export async function GET(request: NextRequest) {
  const auth = await requireRecruiter()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const recruiterId = auth.recruiter.id

  try {
    const result = await sql`
      SELECT
        ra.id                        AS assignment_id,
        ra.client_id,
        ra.plan_type,
        ra.applications_per_day,
        ra.assigned_at,
        ra.status                    AS assignment_status,
        ra.notes                     AS assignment_notes,
        u.name                       AS client_name,
        u.email                      AS client_email,
        s.subscription_type,
        s.status                     AS subscription_status,
        COUNT(at.id)                 AS total_submissions,
        COUNT(at.id) FILTER (
          WHERE at.status NOT IN (
            'not_selected', 'no_response',
            'position_closed', 'application_withdrawn'
          )
        )                            AS active_submissions,
        COUNT(at.id) FILTER (
          WHERE at.status IN (
            'interview_scheduled', 'interview_completed',
            'second_interview_scheduled'
          )
        )                            AS interview_count,
        MAX(at.submitted_at)         AS last_submission_at
      FROM recruiter_assignments ra
      JOIN users u ON u.id = ra.client_id
      LEFT JOIN subscriptions s
        ON s.user_id = ra.client_id
        AND s.status = 'active'
        AND s.subscription_type LIKE 'recruiter_%'
      LEFT JOIN application_tracking at
        ON at.assignment_id = ra.id
      WHERE ra.recruiter_id = ${recruiterId}
        AND ra.status = 'active'
      GROUP BY
        ra.id, ra.client_id, ra.plan_type, ra.applications_per_day,
        ra.assigned_at, ra.status, ra.notes,
        u.name, u.email,
        s.subscription_type, s.status
      ORDER BY ra.assigned_at DESC
    `

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      clients: result.rows,
    })
  } catch (error) {
    console.error("[recruiter/clients GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    )
  }
}
