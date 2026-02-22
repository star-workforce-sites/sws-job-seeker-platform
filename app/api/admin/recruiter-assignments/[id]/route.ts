import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 }
  }
  const result = await sql`
    SELECT role FROM users WHERE email = ${session.user.email}
  `
  if (!result.rows[0] || result.rows[0].role !== "admin") {
    return { error: "Forbidden - Admin access required", status: 403 }
  }
  return { session }
}

// ── GET /api/admin/recruiter-assignments/[id] ────────────────
// Returns a single assignment with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params

    const result = await sql`
      SELECT
        ra.*,
        u.name    AS job_seeker_name,
        u.email   AS job_seeker_email,
        r.name    AS recruiter_name,
        r.email   AS recruiter_email,
        rs.plan_name,
        rs.status AS subscription_status
      FROM recruiter_assignments ra
      JOIN users u  ON u.id = ra.user_id
      JOIN users r  ON r.id = ra.recruiter_id
      JOIN recruiter_subscriptions rs ON rs.id = ra.subscription_id
      WHERE ra.id = ${id}
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, assignment: result.rows[0] })
  } catch (error) {
    console.error("[admin/recruiter-assignments/[id] GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    )
  }
}

// ── PUT /api/admin/recruiter-assignments/[id] ────────────────
// Updates recruiter, status, or notes on an existing assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { recruiter_id, status, notes } = body

    // Validate assignment exists
    const existing = await sql`
      SELECT id FROM recruiter_assignments WHERE id = ${id}
    `
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    // If recruiter_id provided, validate it
    if (recruiter_id) {
      const recruiterCheck = await sql`
        SELECT id FROM users WHERE id = ${recruiter_id} AND role = 'recruiter'
      `
      if (recruiterCheck.rows.length === 0) {
        return NextResponse.json({ error: "Recruiter not found" }, { status: 404 })
      }
    }

    // Build dynamic update
    const updates: string[] = ["updated_at = NOW()"]
    if (recruiter_id) updates.push(`recruiter_id = '${recruiter_id}'`)
    if (status) updates.push(`status = '${status}'`)
    if (notes !== undefined) updates.push(`notes = '${notes}'`)

    const updateQuery = `
      UPDATE recruiter_assignments
      SET ${updates.join(", ")}
      WHERE id = '${id}'
      RETURNING *
    `
    const result = await sql.query(updateQuery)

    return NextResponse.json({
      success: true,
      message: "Assignment updated successfully",
      assignment: result.rows[0],
    })
  } catch (error) {
    console.error("[admin/recruiter-assignments/[id] PUT]", error)
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    )
  }
}

// ── DELETE /api/admin/recruiter-assignments/[id] ─────────────
// Soft-deletes an assignment (sets status to inactive)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params

    const result = await sql`
      UPDATE recruiter_assignments
      SET status = 'inactive', updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, status
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Assignment deactivated",
      assignment: result.rows[0],
    })
  } catch (error) {
    console.error("[admin/recruiter-assignments/[id] DELETE]", error)
    return NextResponse.json(
      { error: "Failed to deactivate assignment" },
      { status: 500 }
    )
  }
}
