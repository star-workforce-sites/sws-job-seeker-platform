import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import { NextRequest, NextResponse } from "next/server"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  const result = await sql`SELECT id, role FROM users WHERE email = ${session.user.email}`
  if (result.rows.length === 0 || result.rows[0].role !== "admin") return null
  return result.rows[0]
}

// ── GET /api/admin/activity ───────────────────────────────────
// Admin view of CHRM activity events, recruiter submissions, and platform stats
export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const view = searchParams.get("view") // overview, recruiter_performance, user_activity, submissions

  try {
    switch (view) {
      // ── Platform overview stats ───────────────────────────
      case "overview": {
        const [usersResult, subsResult, assignmentsResult, activityResult, submissionsResult] = await Promise.all([
          sql`
            SELECT
              COUNT(*) AS total_users,
              COUNT(*) FILTER (WHERE role = 'jobseeker') AS total_jobseekers,
              COUNT(*) FILTER (WHERE role = 'recruiter') AS total_recruiters,
              COUNT(*) FILTER (WHERE role = 'employer') AS total_employers,
              COUNT(*) FILTER (WHERE suspended = true) AS suspended_users,
              COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_users_7d,
              COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS new_users_30d
            FROM users
          `,
          sql`
            SELECT
              COUNT(*) AS total_active_subscriptions,
              COUNT(*) FILTER (WHERE subscription_type = 'recruiter_basic') AS basic_count,
              COUNT(*) FILTER (WHERE subscription_type = 'recruiter_standard') AS standard_count,
              COUNT(*) FILTER (WHERE subscription_type = 'recruiter_pro') AS pro_count
            FROM subscriptions
            WHERE status = 'active' AND subscription_type LIKE 'recruiter_%'
          `,
          sql`
            SELECT
              COUNT(*) AS total_active_assignments,
              COUNT(*) FILTER (WHERE status = 'active') AS active,
              COUNT(*) FILTER (WHERE status = 'inactive') AS inactive
            FROM recruiter_assignments
          `,
          sql`
            SELECT
              COUNT(*) AS total_events,
              COUNT(*) FILTER (WHERE event_type = 'job_viewed') AS job_views,
              COUNT(*) FILTER (WHERE event_type = 'job_saved') AS job_saves,
              COUNT(*) FILTER (WHERE event_type = 'candidate_submitted') AS candidate_submissions,
              COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS events_7d,
              COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') AS events_24h
            FROM chrm_activity_events
          `,
          sql`
            SELECT
              COUNT(*) AS total_submissions,
              COUNT(*) FILTER (WHERE submitted_at >= NOW() - INTERVAL '7 days') AS submissions_7d,
              COUNT(*) FILTER (WHERE submitted_at >= NOW() - INTERVAL '24 hours') AS submissions_24h,
              COUNT(*) FILTER (WHERE status IN ('interview_scheduled','interview_completed','second_interview_scheduled')) AS interview_count
            FROM application_tracking
          `,
        ])

        return NextResponse.json({
          users: usersResult.rows[0],
          subscriptions: subsResult.rows[0],
          assignments: assignmentsResult.rows[0],
          chrm_activity: activityResult.rows[0],
          recruiter_submissions: submissionsResult.rows[0],
        })
      }

      // ── Recruiter performance breakdown ───────────────────
      case "recruiter_performance": {
        const result = await sql`
          SELECT
            u.id AS recruiter_id,
            u.name AS recruiter_name,
            u.email AS recruiter_email,
            u.suspended,
            COUNT(ra.id) FILTER (WHERE ra.status = 'active') AS active_clients,
            (
              SELECT COUNT(*)
              FROM application_tracking at2
              WHERE at2.recruiter_id = u.id
            ) AS total_submissions,
            (
              SELECT COUNT(*)
              FROM application_tracking at3
              WHERE at3.recruiter_id = u.id
                AND at3.submitted_at >= NOW() - INTERVAL '7 days'
            ) AS submissions_7d,
            (
              SELECT COUNT(*)
              FROM application_tracking at4
              WHERE at4.recruiter_id = u.id
                AND at4.submitted_at >= NOW() - INTERVAL '24 hours'
            ) AS submissions_24h,
            (
              SELECT COUNT(*)
              FROM application_tracking at5
              WHERE at5.recruiter_id = u.id
                AND at5.status IN ('interview_scheduled','interview_completed','second_interview_scheduled')
            ) AS interview_conversions
          FROM users u
          LEFT JOIN recruiter_assignments ra ON ra.recruiter_id = u.id
          WHERE u.role = 'recruiter'
          GROUP BY u.id, u.name, u.email, u.suspended
          ORDER BY total_submissions DESC
        `
        return NextResponse.json({ recruiters: result.rows })
      }

      // ── Individual user activity ──────────────────────────
      case "user_activity": {
        const userId = searchParams.get("user_id")
        if (!userId) {
          return NextResponse.json({ error: "user_id required" }, { status: 400 })
        }

        const [userResult, activityResult, submissionsResult, subscriptionResult] = await Promise.all([
          sql`SELECT id, name, email, role, suspended, created_at, last_login FROM users WHERE id = ${userId}`,
          sql`
            SELECT event_type, job_id, metadata, created_at
            FROM chrm_activity_events
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
            LIMIT 50
          `,
          sql`
            SELECT id, job_title, company_name, status, submitted_at, feedback_received
            FROM application_tracking
            WHERE client_id = ${userId}
            ORDER BY submitted_at DESC
            LIMIT 50
          `,
          sql`
            SELECT subscription_type, status, created_at, current_period_end
            FROM subscriptions
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
            LIMIT 5
          `,
        ])

        return NextResponse.json({
          user: userResult.rows[0] ?? null,
          activity: activityResult.rows,
          submissions: submissionsResult.rows,
          subscriptions: subscriptionResult.rows,
        })
      }

      // ── All submissions (application_tracking) ────────────
      case "submissions": {
        const recruiterId = searchParams.get("recruiter_id")
        const limit = parseInt(searchParams.get("limit") || "50")

        let result
        if (recruiterId) {
          result = await sql`
            SELECT
              at.id, at.job_title, at.company_name, at.status,
              at.submitted_at, at.feedback_received, at.feedback_notes,
              at.notes, at.job_url,
              u.name AS client_name, u.email AS client_email
            FROM application_tracking at
            JOIN users u ON u.id = at.client_id
            WHERE at.recruiter_id = ${recruiterId}
            ORDER BY at.submitted_at DESC
            LIMIT ${limit}
          `
        } else {
          result = await sql`
            SELECT
              at.id, at.job_title, at.company_name, at.status,
              at.submitted_at, at.feedback_received, at.feedback_notes,
              at.notes, at.job_url,
              u.name AS client_name, u.email AS client_email,
              r.name AS recruiter_name
            FROM application_tracking at
            JOIN users u ON u.id = at.client_id
            LEFT JOIN users r ON r.id = at.recruiter_id
            ORDER BY at.submitted_at DESC
            LIMIT ${limit}
          `
        }

        return NextResponse.json({ submissions: result.rows })
      }

      default:
        return NextResponse.json({
          error: "Invalid view. Use: overview, recruiter_performance, user_activity, submissions",
        }, { status: 400 })
    }
  } catch (error) {
    console.error("[Admin Activity GET]", error)
    return NextResponse.json({ error: "Failed to fetch activity data" }, { status: 500 })
  }
}
