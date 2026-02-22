import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sql } from "@vercel/postgres"
import AdminDashboardClient from "./AdminDashboardClient"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  // ── Auth guard: must be logged in ─────────────────────────
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/auth/login")
  }

  // ── Auth guard: must be admin role ─────────────────────────
  const userResult = await sql`
    SELECT id, name, email, role
    FROM users
    WHERE email = ${session.user.email}
  `

  if (userResult.rows.length === 0 || userResult.rows[0].role !== "admin") {
    redirect("/dashboard/job-seeker")
  }

  // ── Fetch all active subscribers with assignment status ────
  let subscribers: any[] = []
  try {
    const subResult = await sql`
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
      LEFT JOIN recruiter_assignments ra
        ON ra.subscription_id = rs.id AND ra.status = 'active'
      LEFT JOIN users r ON r.id = ra.recruiter_id
      WHERE rs.status = 'active'
      ORDER BY rs.created_at DESC
    `
    subscribers = subResult.rows
  } catch (error) {
    console.error("[AdminDashboard] Error fetching subscribers:", error)
    // Render with empty state — do not crash the page
  }

  // ── Fetch all recruiters ───────────────────────────────────
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
