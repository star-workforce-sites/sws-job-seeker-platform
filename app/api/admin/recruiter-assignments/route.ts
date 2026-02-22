import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"

// ── Auth guard: admin only ───────────────────────────────────
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

// ── GET /api/admin/recruiter-assignments ─────────────────────
// Returns all recruiter_subscriptions with assignment status
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // assigned | unassigned | all
    const planFilter = searchParams.get("plan") // optional plan filter

    let query = `
      SELECT
        rs.id                          AS subscription_id,
        rs.user_id,
        rs.plan_name,
        rs.status                      AS subscription_status,
        rs.stripe_subscription_id,
        rs.created_at                  AS subscribed_at,
        u.name                         AS job_seeker_name,
        u.email                        AS job_seeker_email,
        ra.id                          AS assignment_id,
        ra.recruiter_id,
        ra.status                      AS assignment_status,
        ra.assigned_at,
        ra.notes                       AS assignment_notes,
        r.name                         AS recruiter_name,
        r.email                        AS recruiter_email
      FROM recruiter_subscriptions rs
      JOIN users u ON u.id = rs.user_id
      LEFT JOIN recruiter_assignments ra ON ra.subscription_id = rs.id
      LEFT JOIN users r ON r.id = ra.recruiter_id
      WHERE rs.status = 'active'
    `

    const conditions: string[] = []
    if (status === "unassigned") {
      conditions.push("ra.id IS NULL")
    } else if (status === "assigned") {
      conditions.push("ra.id IS NOT NULL")
    }
    if (planFilter) {
      conditions.push(`rs.plan_name = '${planFilter}'`)
    }

    if (conditions.length > 0) {
      query += " AND " + conditions.join(" AND ")
    }

    query += " ORDER BY rs.created_at DESC"

    const result = await sql.query(query)

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      assignments: result.rows,
    })
  } catch (error) {
    console.error("[admin/recruiter-assignments GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    )
  }
}

// ── POST /api/admin/recruiter-assignments ────────────────────
// Assigns a recruiter to a job seeker subscription
export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const { subscription_id, recruiter_id, notes } = body

    // Validate required fields
    if (!subscription_id || !recruiter_id) {
      return NextResponse.json(
        { error: "subscription_id and recruiter_id are required" },
        { status: 400 }
      )
    }

    // Verify subscription exists and is active
    const subCheck = await sql`
      SELECT id, user_id, plan_name FROM recruiter_subscriptions
      WHERE id = ${subscription_id} AND status = 'active'
    `
    if (subCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Active subscription not found" },
        { status: 404 }
      )
    }

    // Verify recruiter exists with recruiter role
    const recruiterCheck = await sql`
      SELECT id, name, email FROM users
      WHERE id = ${recruiter_id} AND role = 'recruiter'
    `
    if (recruiterCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Recruiter not found" },
        { status: 404 }
      )
    }

    // Check if assignment already exists for this subscription
    const existingAssignment = await sql`
      SELECT id FROM recruiter_assignments
      WHERE subscription_id = ${subscription_id}
    `

    let assignment
    if (existingAssignment.rows.length > 0) {
      // Update existing assignment
      assignment = await sql`
        UPDATE recruiter_assignments
        SET
          recruiter_id  = ${recruiter_id},
          status        = 'active',
          notes         = ${notes || null},
          assigned_at   = NOW(),
          updated_at    = NOW()
        WHERE subscription_id = ${subscription_id}
        RETURNING *
      `
    } else {
      // Create new assignment
      assignment = await sql`
        INSERT INTO recruiter_assignments (
          subscription_id,
          recruiter_id,
          user_id,
          status,
          notes,
          assigned_at,
          created_at,
          updated_at
        ) VALUES (
          ${subscription_id},
          ${recruiter_id},
          ${subCheck.rows[0].user_id},
          'active',
          ${notes || null},
          NOW(),
          NOW(),
          NOW()
        )
        RETURNING *
      `
    }

    return NextResponse.json({
      success: true,
      message: "Recruiter assigned successfully",
      assignment: assignment.rows[0],
      recruiter: recruiterCheck.rows[0],
      subscription: subCheck.rows[0],
    })
  } catch (error) {
    console.error("[admin/recruiter-assignments POST]", error)
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    )
  }
}
