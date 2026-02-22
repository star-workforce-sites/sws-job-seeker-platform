import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sql } from "@vercel/postgres"
import AdminDashboardClient from "./AdminDashboardClient"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  // ── Auth: must be logged in ───────────────────────────────
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/auth/login")
  }

  // ── Auth: must be admin role ──────────────────────────────
  const userResult = await sql`
    SELECT id, name, email, role
    FROM users
    WHERE email = ${session.user.email}
  `
  if (userResult.rows.length === 0 || userResult.rows[0].role !== "admin") {
    redirect("/dashboard/job-seeker")
  }

  // ── Fetch active recruiter subscribers with assignment status ─
  // NOTE: table is "subscriptions" with subscription_type LIKE 'recruiter_%'
  //       recruiter_assignments uses client_id for the job seeker (not user_id)
  let subscribers: any[] = []
  try {
    const subResult = await sql`
      SELECT
        s.id                  AS subscription_id,
        s.subscription_type   AS plan_name,
        s.status              AS subscription_status,
        s.created_at          AS subscribed_at,
        u.id                  AS user_id,
        u.name                AS job_seeker_name,
        u.email               AS job_seeker_email,
        ra.id                 AS assignment_id,
        ra.status             AS assignment_status,
        ra.assigned_at,
        ra.applications_per_day,
        r.name                AS recruiter_name,
        r.email               AS recruiter_email
      FROM subscriptions s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN recruiter_assignments ra
        ON ra.subscription_id = s.id AND ra.status = 'active'
      LEFT JOIN users r ON r.id = ra.recruiter_id
      WHERE s.status = 'active'
        AND s.subscription_type LIKE 'recruiter_%'
      ORDER BY s.created_at DESC
    `
    subscribers = subResult.rows
  } catch (error) {
    console.error("[AdminDashboard] Error fetching subscribers:", error)
  }

  // ── Fetch all recruiters with active assignment count ─────
  let recruiters: any[] = []
  try {
    const recResult = await sql`
      SELECT
        u.id,
        u.name,
        u.email,
        COUNT(ra.id) FILTER (WHERE ra.status = 'active') AS active_assignments
      FROM users u
      LEFT JOIN recruiter_assignments ra ON ra.recruiter_id = u.id
      WHERE u.role = 'recruiter'
      GROUP BY u.id, u.name, u.email
      ORDER BY u.name ASC
    `
    recruiters = recResult.rows
  } catch (error) {
    console.error("[AdminDashboard] Error fetching recruiters:", error)
  }

  return (
    <AdminDashboardClient
      initialSubscribers={subscribers}
      initialRecruiters={recruiters}
    />
  )
}
