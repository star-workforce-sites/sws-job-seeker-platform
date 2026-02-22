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

// ── GET /api/admin/subscribers ───────────────────────────────
// Returns active recruiter subscribers with optional unassigned filter
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const unassignedOnly = searchParams.get("unassigned") === "true"

    const result = await sql`
      SELECT
        rs.id          AS subscription_id,
        rs.plan_name,
        rs.status      AS subscription_status,
        rs.created_at  AS subscribed_at,
        u.id           AS user_id,
        u.name         AS job_seeker_name,
        u.email        AS job_seeker_email,
        ra.id          AS assignment_id,
        ra.status      AS assignment_status,
        ra.assigned_at,
        r.name         AS recruiter_name,
        r.email        AS recruiter_email
      FROM recruiter_subscriptions rs
      JOIN users u ON u.id = rs.user_id
      LEFT JOIN recruiter_assignments ra ON ra.subscription_id = rs.id AND ra.status = 'active'
      LEFT JOIN users r ON r.id = ra.recruiter_id
      WHERE rs.status = 'active'
        AND (${unassignedOnly}::boolean = false OR ra.id IS NULL)
      ORDER BY rs.created_at DESC
    `

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      subscribers: result.rows,
    })
  } catch (error) {
    console.error("[admin/subscribers GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    )
  }
}
