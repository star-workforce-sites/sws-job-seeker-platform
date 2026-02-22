import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"

const VALID_STATUSES = [
  "submitted",
  "confirmed",
  "under_review",
  "screening_scheduled",
  "screening_completed",
  "interview_scheduled",
  "interview_completed",
  "second_interview_scheduled",
  "assessment_scheduled",
  "assessment_completed",
  "references_requested",
  "not_selected",
  "no_response",
  "position_closed",
  "application_withdrawn",
] as const

async function requireRecruiter() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 }
  }
  const result = await sql`
    SELECT id, name, email, role FROM users
    WHERE email = ${session.user.email}
  `
  if (!result.rows[0] || result.rows[0].role !== "recruiter") {
    return { error: "Forbidden - Recruiter access required", status: 403 }
  }
  return { recruiter: result.rows[0] }
}

// ── GET /api/recruiter/submissions/[id] ───────────────────────
// Returns a single submission — must belong to this recruiter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRecruiter()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const recruiterId = auth.recruiter.id

    const result = await sql`
      SELECT
        at.*,
        u.name  AS client_name,
        u.email AS client_email,
        ra.plan_type,
        ra.applications_per_day
      FROM application_tracking at
      JOIN users u ON u.id = at.client_id
      JOIN recruiter_assignments ra ON ra.id = at.assignment_id
      WHERE at.id = ${id}
        AND at.recruiter_id = ${recruiterId}
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, submission: result.rows[0] })
  } catch (error) {
    console.error("[recruiter/submissions/[id] GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    )
  }
}

// ── PUT /api/recruiter/submissions/[id] ───────────────────────
// Updates status, feedback, or notes on a submission
// Only the recruiter who logged it can update it
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRecruiter()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const recruiterId = auth.recruiter.id

    const body = await request.json()
    const {
      status,
      notes,
      feedback_received,
      feedback_date,
      feedback_notes,
    } = body

    // Validate submission belongs to this recruiter
    const existing = await sql`
      SELECT id, status FROM application_tracking
      WHERE id = ${id} AND recruiter_id = ${recruiterId}
    `
    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      )
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status as any)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      )
    }

    // Build update — only update fields that were provided
    const updates: string[] = ["updated_at = NOW()"]
    if (status !== undefined)           updates.push(`status = '${status}'`)
    if (notes !== undefined)            updates.push(`notes = ${notes ? `'${notes.replace(/'/g, "''")}'` : "NULL"}`)
    if (feedback_received !== undefined) updates.push(`feedback_received = ${feedback_received}`)
    if (feedback_date !== undefined)    updates.push(`feedback_date = ${feedback_date ? `'${feedback_date}'` : "NULL"}`)
    if (feedback_notes !== undefined)   updates.push(`feedback_notes = ${feedback_notes ? `'${feedback_notes.replace(/'/g, "''")}'` : "NULL"}`)

    const updateQuery = `
      UPDATE application_tracking
      SET ${updates.join(", ")}
      WHERE id = '${id}' AND recruiter_id = '${recruiterId}'
      RETURNING *
    `
    const result = await sql.query(updateQuery)

    return NextResponse.json({
      success: true,
      message: "Submission updated successfully",
      submission: result.rows[0],
    })
  } catch (error) {
    console.error("[recruiter/submissions/[id] PUT]", error)
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    )
  }
}
