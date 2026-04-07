import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sql } from "@vercel/postgres"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// Badge removed — now handled by PlanManagerClient
import {
  FileText,
  Mail,
  Briefcase,
  Upload,
  TrendingUp,
  CheckCircle,
  ExternalLink,
} from "lucide-react"
import CHRMJobSeekerPanel from "./CHRMJobSeekerPanel"
import CHRMMarketIntelSnapshot from "./CHRMMarketIntelSnapshot"
import PlanManagerClient from "./PlanManagerClient"

export const dynamic = "force-dynamic"

// ── DOL-compliant status label + color ───────────────────────
function statusLabel(status: string): string {
  const map: Record<string, string> = {
    submitted:                  "Submitted",
    confirmed:                  "Confirmed",
    under_review:               "Under Review",
    screening_scheduled:        "Screening Scheduled",
    screening_completed:        "Screening Completed",
    interview_scheduled:        "Interview Scheduled",
    interview_completed:        "Interview Completed",
    second_interview_scheduled: "2nd Interview Scheduled",
    assessment_scheduled:       "Assessment Scheduled",
    assessment_completed:       "Assessment Completed",
    references_requested:       "References Requested",
    not_selected:               "Not Selected",
    no_response:                "No Response",
    position_closed:            "Position Closed",
    application_withdrawn:      "Application Withdrawn",
  }
  return map[status] ?? status
}

function statusColor(status: string): string {
  if (["interview_scheduled", "interview_completed", "second_interview_scheduled"].includes(status))
    return "bg-green-100 text-green-800"
  if (["screening_scheduled", "screening_completed", "assessment_scheduled", "assessment_completed", "references_requested"].includes(status))
    return "bg-blue-100 text-blue-800"
  if (["not_selected", "no_response", "position_closed", "application_withdrawn"].includes(status))
    return "bg-gray-100 text-gray-700"
  if (["submitted", "confirmed", "under_review"].includes(status))
    return "bg-yellow-100 text-yellow-800"
  return "bg-gray-100 text-gray-700"
}

function planLabel(planType: string): string {
  const map: Record<string, string> = {
    recruiter_basic:    "Basic (4 apps/day)",
    recruiter_standard: "Standard (12 apps/day)",
    recruiter_pro:      "Pro (25 apps/day)",
  }
  return map[planType] ?? planType
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

export default async function JobSeekerDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect("/auth/login")

  // ── Get user ──────────────────────────────────────────────
  const userResult = await sql`
    SELECT id, name, email, role
    FROM users
    WHERE email = ${session.user.email}
  `
  if (userResult.rows.length === 0 || userResult.rows[0].role !== "jobseeker") {
    redirect("/auth/login")
  }
  const user = userResult.rows[0]

  // ── Get active recruiter subscription ─────────────────────
  let subscription: any = null
  let hasRecruiterSubscription = false
  try {
    const subResult = await sql`
      SELECT subscription_type, status, current_period_end
      FROM subscriptions
      WHERE user_id = ${user.id}
        AND status = 'active'
        AND subscription_type LIKE 'recruiter_%'
      ORDER BY created_at DESC
      LIMIT 1
    `
    if (subResult.rows.length > 0) {
      subscription = subResult.rows[0]
      hasRecruiterSubscription = true
    }
  } catch (error) {
    console.error("[JobSeekerDashboard] subscription fetch error:", error)
  }

  // ── Get recruiter assignment ───────────────────────────────
  let assignment: any = null
  let assignedRecruiter: any = null
  try {
    const assignResult = await sql`
      SELECT
        ra.id,
        ra.plan_type,
        ra.applications_per_day,
        ra.assigned_at,
        ra.status AS assignment_status,
        u.name  AS recruiter_name,
        u.email AS recruiter_email
      FROM recruiter_assignments ra
      JOIN users u ON u.id = ra.recruiter_id
      WHERE ra.client_id = ${user.id}
        AND ra.status = 'active'
      ORDER BY ra.assigned_at DESC
      LIMIT 1
    `
    if (assignResult.rows.length > 0) {
      assignment = assignResult.rows[0]
      assignedRecruiter = {
        name:  assignment.recruiter_name,
        email: assignment.recruiter_email,
      }
    }
  } catch (error) {
    console.error("[JobSeekerDashboard] assignment fetch error:", error)
  }

  // ── Get submissions from application_tracking ─────────────
  let submissions: any[] = []
  let totalSubmissions = 0
  let interviewCount   = 0
  let responseCount    = 0
  let todayCount       = 0

  try {
    const subResult = await sql`
      SELECT
        at.id,
        at.job_title,
        at.company_name,
        at.job_url,
        at.status,
        at.application_date,
        at.submitted_at,
        at.feedback_received,
        at.feedback_notes,
        at.notes,
        at.updated_at
      FROM application_tracking at
      WHERE at.client_id = ${user.id}
      ORDER BY at.submitted_at DESC
      LIMIT 100
    `
    submissions      = subResult.rows
    totalSubmissions = submissions.length

    interviewCount = submissions.filter((s) =>
      ["interview_scheduled", "interview_completed", "second_interview_scheduled"].includes(s.status)
    ).length

    responseCount = submissions.filter((s) =>
      s.feedback_received === true ||
      ["screening_scheduled", "screening_completed", "interview_scheduled",
       "interview_completed", "second_interview_scheduled",
       "assessment_scheduled", "assessment_completed",
       "references_requested"].includes(s.status)
    ).length

    const today = new Date().toISOString().split("T")[0]
    todayCount = submissions.filter((s) => {
      const d = s.application_date || s.submitted_at
      return d && String(d).startsWith(today)
    }).length
  } catch (error) {
    console.error("[JobSeekerDashboard] submissions fetch error:", error)
  }

  // ── Old applications table count (existing jobs platform) ─
  let legacyApplicationCount = 0
  try {
    const appResult = await sql`
      SELECT COUNT(*) as count FROM applications WHERE "userId" = ${user.id}
    `
    legacyApplicationCount = parseInt(appResult.rows[0]?.count || "0")
  } catch {
    // Table may not exist — silently ignore
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground premium-heading">
            Welcome back, {user.name || "Job Seeker"}!
          </h1>
          <p className="text-muted-foreground mt-2 premium-body">
            Your job search dashboard
          </p>
        </div>

        {/* ── Top Row: Plan Manager (2 cols) + Market Intel (1 col) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Columns 1-2: Plan + Recruiter (inline upgrade/downgrade) */}
          <PlanManagerClient
            currentPlan={hasRecruiterSubscription ? subscription?.subscription_type : null}
            renewalDate={subscription?.current_period_end || null}
            assignedRecruiter={assignedRecruiter}
            isAssigned={!!assignedRecruiter}
          />

          {/* Column 3: Market Intelligence Snapshot (client component) */}
          <CHRMMarketIntelSnapshot />
        </div>

        {/* ── Stats Grid ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Briefcase className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground premium-body">
                  {hasRecruiterSubscription ? "Applications by Recruiter" : "Applications"}
                </p>
                <p className="text-2xl font-bold text-foreground premium-heading">
                  {hasRecruiterSubscription ? totalSubmissions : legacyApplicationCount}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground premium-body">Interview Stage</p>
                <p className="text-2xl font-bold text-foreground premium-heading">
                  {interviewCount}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Mail className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground premium-body">Responses</p>
                <p className="text-2xl font-bold text-foreground premium-heading">
                  {responseCount}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Submissions Table (only when subscribed) ─────── */}
        {hasRecruiterSubscription && (
          <Card className="mb-8 p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-foreground premium-heading">
                  Applications Submitted by Your Recruiter
                </h2>
                <p className="text-sm text-muted-foreground premium-body mt-0.5">
                  {totalSubmissions > 0
                    ? `${totalSubmissions} total · ${todayCount} today`
                    : "No submissions yet — your recruiter will start soon"}
                </p>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                {assignedRecruiter ? (
                  <>
                    <p className="text-foreground font-medium premium-heading">
                      {assignedRecruiter.name} hasn't logged any applications yet
                    </p>
                    <p className="text-sm text-muted-foreground premium-body mt-1">
                      Applications will appear here as your recruiter submits them
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-foreground font-medium premium-heading">
                      Awaiting recruiter assignment
                    </p>
                    <p className="text-sm text-muted-foreground premium-body mt-1">
                      Applications will appear here once your recruiter is assigned and starts working
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-3 py-3 text-left font-semibold text-foreground premium-heading">Date</th>
                      <th className="px-3 py-3 text-left font-semibold text-foreground premium-heading">Job Title</th>
                      <th className="px-3 py-3 text-left font-semibold text-foreground premium-heading">Company</th>
                      <th className="px-3 py-3 text-left font-semibold text-foreground premium-heading">Status</th>
                      <th className="px-3 py-3 text-left font-semibold text-foreground premium-heading">Feedback</th>
                      <th className="px-3 py-3 text-left font-semibold text-foreground premium-heading">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr
                        key={sub.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-3 text-muted-foreground premium-body whitespace-nowrap">
                          {formatDate(sub.application_date || sub.submitted_at)}
                        </td>
                        <td className="px-3 py-3 text-foreground premium-body max-w-[200px]">
                          <div className="font-medium truncate">{sub.job_title}</div>
                          {sub.notes && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5">
                              {sub.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-foreground premium-body whitespace-nowrap">
                          {sub.company_name}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${statusColor(sub.status)}`}>
                            {statusLabel(sub.status)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm premium-body">
                          {sub.feedback_received ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span className="text-xs">
                                {sub.feedback_notes
                                  ? sub.feedback_notes.length > 40
                                    ? sub.feedback_notes.slice(0, 40) + "..."
                                    : sub.feedback_notes
                                  : "Received"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {sub.job_url ? (
                            <a
                              href={sub.job_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0A1A2F] hover:text-[#E8C547] transition"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* ── Quick Actions (preserved exactly) ────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/tools/ats-optimizer">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <FileText className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2 premium-heading">ATS Optimizer</h3>
              <p className="text-sm text-muted-foreground premium-body">
                Optimize your resume for ATS systems
              </p>
            </Card>
          </Link>

          <Link href="/tools/cover-letter">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <Upload className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2 premium-heading">Cover Letter</h3>
              <p className="text-sm text-muted-foreground premium-body">
                Generate AI-powered cover letters
              </p>
            </Card>
          </Link>

          <Link href="/jobs">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <Briefcase className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2 premium-heading">Browse Jobs</h3>
              <p className="text-sm text-muted-foreground premium-body">
                Search and apply to consulting roles
              </p>
            </Card>
          </Link>
        </div>

        {/* ── CHRM NEXUS Job Feed, Market Intelligence & Hot Jobs ── */}
        <div className="mt-8">
          <CHRMJobSeekerPanel />
        </div>

      </div>
    </div>
  )
}
