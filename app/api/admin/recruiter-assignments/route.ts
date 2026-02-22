import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import {
  sendAssignmentConfirmationToJobSeeker,
  sendAssignmentNotificationToRecruiter,
  getPlanDetails,
} from "@/lib/send-recruiter-emails"

// ── Auth guard: admin only ────────────────────────────────────
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

// ── GET /api/admin/recruiter-assignments ──────────────────────
// Returns all active recruiter subscriptions with assignment status
// Uses: subscriptions table (recruiter_subscriptions does not exist)
// Uses: client_id on recruiter_assignments (not user_id)
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get("status") // assigned | unassigned | all

    let queryStr = `
      SELECT
        s.id                           AS subscription_id,
        s.user_id,
        s.subscription_type            AS plan_name,
        s.status                       AS subscription_status,
        s.stripe_subscription_id,
        s.created_at                   AS subscribed_at,
        u.name                         AS job_seeker_name,
        u.email                        AS job_seeker_email,
        ra.id                          AS assignment_id,
        ra.recruiter_id,
        ra.status                      AS assignment_status,
        ra.assigned_at,
        ra.notes                       AS assignment_notes,
        ra.plan_type,
        ra.applications_per_day,
        r.name                         AS recruiter_name,
        r.email                        AS recruiter_email
      FROM subscriptions s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN recruiter_assignments ra
        ON ra.subscription_id = s.id AND ra.status = 'active'
      LEFT JOIN users r ON r.id = ra.recruiter_id
      WHERE s.status = 'active'
        AND s.subscription_type LIKE 'recruiter_%'
    `

    if (statusFilter === "unassigned") {
      queryStr += " AND ra.id IS NULL"
    } else if (statusFilter === "assigned") {
      queryStr += " AND ra.id IS NOT NULL"
    }

    queryStr += " ORDER BY s.created_at DESC"

    const result = await sql.query(queryStr)

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

// ── POST /api/admin/recruiter-assignments ─────────────────────
// Assigns a recruiter to a subscriber + sends both emails
export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const { subscription_id, recruiter_id, notes } = body

    if (!subscription_id || !recruiter_id) {
      return NextResponse.json(
        { error: "subscription_id and recruiter_id are required" },
        { status: 400 }
      )
    }

    // Verify subscription exists and is active recruiter plan
    const subCheck = await sql`
      SELECT s.id, s.user_id, s.subscription_type,
             u.name AS job_seeker_name, u.email AS job_seeker_email
      FROM subscriptions s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = ${subscription_id}
        AND s.status = 'active'
        AND s.subscription_type LIKE 'recruiter_%'
    `
    if (subCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Active recruiter subscription not found" },
        { status: 404 }
      )
    }
    const sub = subCheck.rows[0]

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
    const recruiter = recruiterCheck.rows[0]

    // Get plan details for applications_per_day
    const planDetails = getPlanDetails(sub.subscription_type)

    // Check if assignment already exists for this subscription
    const existingAssignment = await sql`
      SELECT id FROM recruiter_assignments
      WHERE subscription_id = ${subscription_id}
    `

    let assignment
    if (existingAssignment.rows.length > 0) {
      // Update existing assignment (reassignment)
      assignment = await sql`
        UPDATE recruiter_assignments
        SET
          recruiter_id         = ${recruiter_id},
          status               = 'active',
          notes                = ${notes || null},
          assigned_at          = NOW(),
          plan_type            = ${sub.subscription_type},
          applications_per_day = ${planDetails.applicationsPerDay}
        WHERE subscription_id = ${subscription_id}
        RETURNING *
      `
    } else {
      // Create new assignment
      // client_id = the job seeker's user_id (confirmed from live DB schema)
      assignment = await sql`
        INSERT INTO recruiter_assignments (
          recruiter_id,
          client_id,
          subscription_id,
          plan_type,
          applications_per_day,
          status,
          notes,
          assigned_at
        ) VALUES (
          ${recruiter_id},
          ${sub.user_id},
          ${subscription_id},
          ${sub.subscription_type},
          ${planDetails.applicationsPerDay},
          'active',
          ${notes || null},
          NOW()
        )
        RETURNING *
      `
    }

    // ── Send emails (non-blocking — don't fail the request if email fails) ──
    const assignedAt = new Date().toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      dateStyle: 'full',
      timeStyle: 'short',
    })

    const emailResults = await Promise.allSettled([
      // Template 3 → Job Seeker
      sendAssignmentConfirmationToJobSeeker({
        jobSeekerName:    sub.job_seeker_name || 'Valued Client',
        jobSeekerEmail:   sub.job_seeker_email,
        recruiterName:    recruiter.name,
        recruiterEmail:   recruiter.email,
        planName:         planDetails.name,
        applicationsPerDay: planDetails.applicationsPerDay,
      }),
      // Template 4 → Recruiter
      sendAssignmentNotificationToRecruiter({
        recruiterName:    recruiter.name,
        recruiterEmail:   recruiter.email,
        jobSeekerName:    sub.job_seeker_name || 'Client',
        jobSeekerEmail:   sub.job_seeker_email,
        planName:         planDetails.name,
        applicationsPerDay: planDetails.applicationsPerDay,
        assignedAt,
        notes:            notes || null,
      }),
    ])

    const emailStatus = emailResults.map((r, i) => ({
      recipient: i === 0 ? 'job_seeker' : 'recruiter',
      status:    r.status,
      error:     r.status === 'rejected' ? String(r.reason) : undefined,
    }))

    console.log('[admin/recruiter-assignments POST] Emails:', emailStatus)

    return NextResponse.json({
      success: true,
      message: existingAssignment.rows.length > 0
        ? "Recruiter reassigned successfully"
        : "Recruiter assigned successfully",
      assignment:  assignment.rows[0],
      recruiter,
      subscription: sub,
      emails: emailStatus,
    })
  } catch (error) {
    console.error("[admin/recruiter-assignments POST]", error)
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    )
  }
}
