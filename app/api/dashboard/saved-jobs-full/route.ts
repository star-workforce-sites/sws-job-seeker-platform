import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * GET /api/dashboard/saved-jobs-full
 *
 * Returns the user's saved jobs from BOTH sources:
 *  1. Manual jobs (saved_jobs table → joins jobs table for details)
 *  2. CHRM NEXUS jobs (chrm_activity_events where event_type = 'job_saved')
 *
 * CHRM jobs don't have a local details table — the UI fetches live details
 * from the CHRM feed. We return the job_id + saved date so the client can
 * match them against the feed.
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // ── 1. Manual saved jobs with full details ────────────────
    let manualJobs: Array<Record<string, unknown>> = []
    try {
      const manualResult = await sql`
        SELECT
          j.id,
          j.title,
          j.description,
          j.location,
          j.industry,
          j."employmentType",
          j."salaryMin",
          j."salaryMax",
          j."expiresAt",
          j."isActive",
          j."createdAt",
          COALESCE(u.name, 'Anonymous Company') AS company,
          sj."savedAt"
        FROM saved_jobs sj
        JOIN jobs j ON j.id = sj."jobId"::uuid
        LEFT JOIN users u ON j."employerId" = u.id
        WHERE sj."userId" = ${userId}
        ORDER BY sj."savedAt" DESC
        LIMIT 100
      `
      manualJobs = manualResult.rows
    } catch (error) {
      // Table may not exist or be empty — continue
      console.error("[Saved Jobs Full] manual jobs error:", error)
    }

    // ── 2. CHRM saved jobs (IDs + saved date) ─────────────────
    let chrmSavedJobs: Array<{ job_id: string; saved_at: string }> = []
    try {
      const chrmResult = await sql`
        SELECT job_id, created_at AS saved_at
        FROM chrm_activity_events
        WHERE user_id = ${userId}
          AND event_type = 'job_saved'
        ORDER BY created_at DESC
        LIMIT 100
      `
      chrmSavedJobs = chrmResult.rows as Array<{ job_id: string; saved_at: string }>
    } catch (error) {
      console.error("[Saved Jobs Full] chrm jobs error:", error)
    }

    return NextResponse.json({
      manualJobs,
      chrmSavedJobs,
      totalCount: manualJobs.length + chrmSavedJobs.length,
    })
  } catch (error) {
    console.error("[Saved Jobs Full] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch saved jobs", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    )
  }
}
