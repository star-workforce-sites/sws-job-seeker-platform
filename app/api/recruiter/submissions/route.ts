import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"

// DOL-compliant status values — the only values allowed
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

// ── GET /api/recruiter/submissions ────────────────────────────
// Returns all submissions logged by this recruiter
// Optional query params:
//   ?assignment_id=  filter by specific client assignment
//   ?status=         filter by status
//   ?limit=          number of results (default 50)
export async function GET(request: NextRequest) {
  const auth = await requireRecruiter()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const recruiterId = auth.recruiter.id

  try {
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get("assignment_id")
    const statusFilter = searchParams.get("status")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200)

    // Build query conditionally
    let queryStr = `
      SELECT
        at.id,
        at.assignment_id,
        at.client_id,
        at.job_title,
        at.company_name,
        at.job_url,
        at.job_description,
        at.application_date,
        at.submitted_at,
        at.status,
        at.feedback_received,
        at.feedback_date,
        at.feedback_notes,
        at.notes,
        at.created_at,
        at.updated_at,
        u.name  AS client_name,
        u.email AS client_email,
        ra.plan_type,
        ra.applications_per_day
      FROM application_tracking at
      JOIN users u ON u.id = at.client_id
      JOIN recruiter_assignments ra ON ra.id = at.assignment_id
      WHERE at.recruiter_id = '${recruiterId}'
    `

    if (assignmentId) {
      queryStr += ` AND at.assignment_id = '${assignmentId}'`
    }
    if (statusFilter && VALID_STATUSES.includes(statusFilter as any)) {
      queryStr += ` AND at.status = '${statusFilter}'`
    }

    queryStr += ` ORDER BY at.submitted_at DESC LIMIT ${limit}`

    const result = await sql.query(queryStr)

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      submissions: result.rows,
    })
  } catch (error) {
    console.error("[recruiter/submissions GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    )
  }
}

// ── POST /api/recruiter/submissions ───────────────────────────
// Logs a new job application submission
// Required: assignment_id, job_title, company_name
// Optional: job_url, job_description, notes, application_date, status
export async function POST(request: NextRequest) {
  const auth = await requireRecruiter()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const recruiterId = auth.recruiter.id

  try {
    const body = await request.json()
    const {
      assignment_id,
      job_title,
      company_name,
      job_url,
      job_description,
      notes,
      application_date,
      status = "submitted",
    } = body

    // Validate required fields
    if (!assignment_id || !job_title || !company_name) {
      return NextResponse.json(
        { error: "assignment_id, job_title, and company_name are required" },
        { status: 400 }
      )
    }

    // Validate status is DOL-compliant
    if (!VALID_STATUSES.includes(status as any)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      )
    }

    // Verify this assignment belongs to this recruiter
    const assignmentCheck = await sql`
      SELECT id, client_id, plan_type
      FROM recruiter_assignments
      WHERE id = ${assignment_id}
        AND recruiter_id = ${recruiterId}
        AND status = 'active'
    `
    if (assignmentCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Assignment not found or not assigned to you" },
        { status: 404 }
      )
    }

    const assignment = assignmentCheck.rows[0]

    // Insert the submission
    const result = await sql`
      INSERT INTO application_tracking (
        assignment_id,
        client_id,
        recruiter_id,
        job_title,
        company_name,
        job_url,
        job_description,
        application_date,
        submitted_at,
        status,
        notes,
        feedback_received,
        created_at,
        updated_at
      ) VALUES (
        ${assignment_id},
        ${assignment.client_id},
        ${recruiterId},
        ${job_title},
        ${company_name},
        ${job_url || null},
        ${job_description || null},
        ${application_date || null},
        NOW(),
        ${status},
        ${notes || null},
        false,
        NOW(),
        NOW()
      )
      RETURNING *
    `

    return NextResponse.json(
      {
        success: true,
        message: "Submission logged successfully",
        submission: result.rows[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[recruiter/submissions POST]", error)
    return NextResponse.json(
      { error: "Failed to log submission" },
      { status: 500 }
    )
  }
}
