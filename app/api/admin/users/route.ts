import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import { NextRequest, NextResponse } from "next/server"

// ── Admin auth guard ──────────────────────────────────────────
async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  const result = await sql`SELECT id, role FROM users WHERE email = ${session.user.email}`
  if (result.rows.length === 0 || result.rows[0].role !== "admin") return null
  return result.rows[0]
}

// ── GET /api/admin/users ──────────────────────────────────────
// Returns all users with optional filters: role, suspended, search
export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const role = searchParams.get("role")         // jobseeker, recruiter, employer, admin
  const suspended = searchParams.get("suspended") // true, false
  const search = searchParams.get("search")     // search by name or email
  const limit = parseInt(searchParams.get("limit") || "100")
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    // Build dynamic query with conditions
    let query = `
      SELECT
        u.id, u.name, u.email, u.role, u.created_at,
        u.last_login, u.suspended, u.suspended_at, u.suspended_reason,
        u.stripe_customer_id,
        (SELECT COUNT(*) FROM subscriptions s WHERE s.user_id = u.id AND s.status = 'active') AS active_subscriptions,
        (SELECT COUNT(*) FROM recruiter_assignments ra WHERE ra.client_id = u.id AND ra.status = 'active') AS as_client_assignments,
        (SELECT COUNT(*) FROM recruiter_assignments ra WHERE ra.recruiter_id = u.id AND ra.status = 'active') AS as_recruiter_assignments
      FROM users u
      WHERE 1=1
    `
    const params: (string | boolean)[] = []
    let paramIdx = 0

    if (role && role !== "all") {
      paramIdx++
      query += ` AND u.role = $${paramIdx}`
      params.push(role)
    }

    if (suspended === "true") {
      query += ` AND u.suspended = true`
    } else if (suspended === "false") {
      query += ` AND (u.suspended = false OR u.suspended IS NULL)`
    }

    if (search && search.trim()) {
      paramIdx++
      query += ` AND (u.name ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx})`
      params.push(`%${search.trim()}%`)
    }

    // Count total before pagination
    const countQuery = query.replace(/SELECT[\s\S]*?FROM users u/, "SELECT COUNT(*) as total FROM users u")

    query += ` ORDER BY u.created_at DESC`
    paramIdx++
    query += ` LIMIT $${paramIdx}`
    params.push(String(limit))
    paramIdx++
    query += ` OFFSET $${paramIdx}`
    params.push(String(offset))

    // Execute both queries
    const countParams = params.slice(0, params.length - 2) // without limit/offset
    const countResult = await sql.query(countQuery, countParams)
    const result = await sql.query(query, params)

    return NextResponse.json({
      users: result.rows,
      total: parseInt(countResult.rows[0]?.total || "0"),
      limit,
      offset,
    })
  } catch (error) {
    console.error("[Admin Users GET]", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// ── PUT /api/admin/users ──────────────────────────────────────
// Update user role, suspend/unsuspend
export async function PUT(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { user_id, action, role, reason } = body

    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    // Prevent admin from modifying themselves
    if (user_id === admin.id) {
      return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 })
    }

    // Verify target user exists
    const userResult = await sql`SELECT id, name, email, role, suspended FROM users WHERE id = ${user_id}`
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const targetUser = userResult.rows[0]

    switch (action) {
      case "change_role": {
        if (!role || !["jobseeker", "recruiter", "employer", "admin"].includes(role)) {
          return NextResponse.json({ error: "Invalid role" }, { status: 400 })
        }
        await sql`UPDATE users SET role = ${role}, updated_at = NOW() WHERE id = ${user_id}`

        // If changing TO recruiter, no further action needed
        // If changing FROM recruiter, deactivate their assignments
        if (targetUser.role === "recruiter" && role !== "recruiter") {
          await sql`
            UPDATE recruiter_assignments SET status = 'inactive'
            WHERE recruiter_id = ${user_id} AND status = 'active'
          `
        }

        return NextResponse.json({
          success: true,
          user_id,
          previous_role: targetUser.role,
          new_role: role,
        })
      }

      case "suspend": {
        await sql`
          UPDATE users
          SET suspended = true, suspended_at = NOW(), suspended_reason = ${reason || "Suspended by admin"}, updated_at = NOW()
          WHERE id = ${user_id}
        `
        // Deactivate all assignments involving this user
        if (targetUser.role === "recruiter") {
          await sql`
            UPDATE recruiter_assignments SET status = 'inactive'
            WHERE recruiter_id = ${user_id} AND status = 'active'
          `
        }
        if (targetUser.role === "jobseeker") {
          await sql`
            UPDATE recruiter_assignments SET status = 'inactive'
            WHERE client_id = ${user_id} AND status = 'active'
          `
        }

        return NextResponse.json({
          success: true,
          user_id,
          action: "suspended",
          reason: reason || "Suspended by admin",
        })
      }

      case "unsuspend": {
        await sql`
          UPDATE users
          SET suspended = false, suspended_at = NULL, suspended_reason = NULL, updated_at = NOW()
          WHERE id = ${user_id}
        `
        return NextResponse.json({ success: true, user_id, action: "unsuspended" })
      }

      default:
        return NextResponse.json({ error: "Invalid action. Use: change_role, suspend, unsuspend" }, { status: 400 })
    }
  } catch (error) {
    console.error("[Admin Users PUT]", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// ── POST /api/admin/users ─────────────────────────────────────
// Create a new user (primarily for adding recruiters)
export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { name, email, role } = body

    if (!name || !email || !role) {
      return NextResponse.json({ error: "name, email, and role are required" }, { status: 400 })
    }
    if (!["jobseeker", "recruiter", "employer", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Check if email already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 })
    }

    const result = await sql`
      INSERT INTO users (name, email, role, email_verified, created_at, updated_at)
      VALUES (${name}, ${email}, ${role}, false, NOW(), NOW())
      RETURNING id, name, email, role, created_at
    `

    return NextResponse.json({ success: true, user: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error("[Admin Users POST]", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
