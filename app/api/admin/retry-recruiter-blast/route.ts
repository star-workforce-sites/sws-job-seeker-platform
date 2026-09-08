import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import { triggerRecruiterEmailBlast } from "@/lib/mailercloud"

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

// ── GET /api/admin/retry-recruiter-blast ─────────────────────
// Lists blast attempts that failed because the candidate's email wasn't
// yet a verified Mailercloud Reply ID, so an admin can see what's waiting.
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const result = await sql`
    SELECT id, stripe_session_id, customer_name, customer_email, status,
           error_message, created_at
    FROM recruiter_blast_log
    WHERE status = 'failed_reply_id'
    ORDER BY created_at DESC
  `
  return NextResponse.json({ pending: result.rows })
}

// ── POST /api/admin/retry-recruiter-blast ────────────────────
// Body: { stripeSessionId: string }
// Re-attempts the blast for a previously-failed order -- call this after
// manually adding the candidate's email as a Mailercloud Reply ID.
export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await request.json().catch(() => ({}))
  const stripeSessionId = body.stripeSessionId
  if (!stripeSessionId) {
    return NextResponse.json({ error: "stripeSessionId is required" }, { status: 400 })
  }

  const rows = await sql`
    SELECT * FROM recruiter_blast_log WHERE stripe_session_id = ${stripeSessionId}
  `
  const row = rows.rows[0]
  if (!row) {
    return NextResponse.json({ error: "No blast log entry found for that session id" }, { status: 404 })
  }

  const result = await triggerRecruiterEmailBlast({
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    targetRoles: row.target_roles || "",
    targetLocations: row.target_locations || "",
    industry: row.industry || "",
    experience: row.experience || "",
    stripeSessionId: row.stripe_session_id,
  })

  return NextResponse.json(result)
}
