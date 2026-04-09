import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sql } from "@vercel/postgres"
import RecruiterDashboardClient from "./RecruiterDashboardClient"

export const dynamic = "force-dynamic"

export default async function RecruiterDashboardPage() {
  // ── Auth: must be logged in ───────────────────────────────
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/auth/login")
  }

  // ── Auth: must be recruiter role ──────────────────────────
  const userResult = await sql`
    SELECT id, name, email, role
    FROM users
    WHERE email = ${session.user.email}
  `
  if (userResult.rows.length === 0 || userResult.rows[0].role !== "recruiter") {
    redirect("/dashboard")
  }

  const recruiter = userResult.rows[0]

  // ── Fetch assigned clients with submission stats ──────────
  let clients: any[] = []
  try {
    const clientResult = await sql`
      SELECT
        ra.id                        AS assignment_id,
        ra.client_id,
        ra.plan_type,
        ra.applications_per_day,
        ra.assigned_at,
        ra.notes                     AS assignment_notes,
        u.name                       AS client_name,
        u.email                      AS client_email,
        s.subscription_type,
        COUNT(at.id)                 AS total_submissions,
        COUNT(at.id) FILTER (
          WHERE at.application_date = CURRENT_DATE
        )                            AS submissions_today,
        COUNT(at.id) FILTER (
          WHERE at.status IN (
            'interview_scheduled', 'interview_completed',
            'second_interview_scheduled'
          )
        )                            AS interview_count,
        MAX(at.submitted_at)         AS last_submission_at,
        -- Profile fields (may be null if not filled in)
        up.phone                     AS client_phone,
        up.linkedin_url              AS client_linkedin,
        up.location                  AS client_location,
        up.work_auth                 AS client_work_auth,
        up.skills                    AS client_skills,
        up.target_titles             AS client_target_titles,
        up.target_locations          AS client_target_locations,
        up.min_rate_hourly           AS client_min_rate,
        up.open_to_remote            AS client_open_to_remote,
        up.open_to_contract          AS client_open_to_contract,
        up.certifications            AS client_certifications,
        up.resume_text               AS client_resume_text
      FROM recruiter_assignments ra
      JOIN users u ON u.id = ra.client_id
      LEFT JOIN subscriptions s
        ON s.user_id = ra.client_id
        AND s.status = 'active'
        AND s.subscription_type LIKE 'recruiter_%'
      LEFT JOIN application_tracking at
        ON at.assignment_id = ra.id
      LEFT JOIN user_profiles up
        ON up.user_id = ra.client_id
      WHERE ra.recruiter_id = ${recruiter.id}
        AND ra.status = 'active'
      GROUP BY
        ra.id, ra.client_id, ra.plan_type, ra.applications_per_day,
        ra.assigned_at, ra.notes,
        u.name, u.email, s.subscription_type,
        up.phone, up.linkedin_url, up.location, up.work_auth,
        up.skills, up.target_titles, up.target_locations,
        up.min_rate_hourly, up.open_to_remote, up.open_to_contract,
        up.certifications, up.resume_text
      ORDER BY ra.assigned_at DESC
    `
    clients = clientResult.rows
  } catch (error) {
    console.error("[RecruiterDashboard] Error fetching clients:", error)
  }

  // ── Fetch last 5 submissions per client (for inline view) ─
  let recentByAssignment: Record<string, any[]> = {}
  try {
    const recResult = await sql`
      SELECT DISTINCT ON (at.assignment_id, at.id)
        at.id,
        at.assignment_id,
        at.job_title,
        at.company_name,
        at.job_url,
        at.status,
        at.application_date,
        at.submitted_at,
        at.feedback_received,
        at.feedback_notes,
        at.notes
      FROM application_tracking at
      WHERE at.recruiter_id = ${recruiter.id}
      ORDER BY at.assignment_id, at.id, at.submitted_at DESC
    `
    // Group into map and keep last 5 per assignment
    for (const row of recResult.rows) {
      const key = row.assignment_id
      if (!recentByAssignment[key]) recentByAssignment[key] = []
      if (recentByAssignment[key].length < 5) {
        recentByAssignment[key].push(row)
      }
    }
  } catch (error) {
    console.error("[RecruiterDashboard] Error fetching recent submissions:", error)
  }

  // ── Fetch recent submissions (last 50) ────────────────────
  let submissions: any[] = []
  try {
    const subResult = await sql`
      SELECT
        at.id,
        at.assignment_id,
        at.job_title,
        at.company_name,
        at.job_url,
        at.status,
        at.application_date,
        at.submitted_at,
        at.feedback_received,
        at.feedback_notes,
        at.notes,
        at.updated_at,
        u.name  AS client_name,
        u.email AS client_email
      FROM application_tracking at
      JOIN users u ON u.id = at.client_id
      WHERE at.recruiter_id = ${recruiter.id}
      ORDER BY at.submitted_at DESC
      LIMIT 50
    `
    submissions = subResult.rows
  } catch (error) {
    console.error("[RecruiterDashboard] Error fetching submissions:", error)
  }

  return (
    <RecruiterDashboardClient
      recruiter={recruiter}
      initialClients={clients}
      initialSubmissions={submissions}
      recentByAssignment={recentByAssignment}
    />
  )
}
