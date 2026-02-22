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

// ── GET /api/admin/recruiters ────────────────────────────────
// Returns all users with role = 'recruiter' plus their active assignment count
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const result = await sql`
      SELECT
        u.id,
        u.name,
        u.email,
        u.created_at,
        COUNT(ra.id) FILTER (WHERE ra.status = 'active') AS active_assignments
      FROM users u
      LEFT JOIN recruiter_assignments ra ON ra.recruiter_id = u.id
      WHERE u.role = 'recruiter'
      GROUP BY u.id, u.name, u.email, u.created_at
      ORDER BY u.name ASC
    `

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      recruiters: result.rows,
    })
  } catch (error) {
    console.error("[admin/recruiters GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch recruiters" },
      { status: 500 }
    )
  }
}
