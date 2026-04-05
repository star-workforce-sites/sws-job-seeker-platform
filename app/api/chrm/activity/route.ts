import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import type { CHRMActivityEventType } from "@/types/chrm-nexus"

export const dynamic = "force-dynamic"

const VALID_EVENT_TYPES: CHRMActivityEventType[] = [
  "job_viewed",
  "candidate_submitted",
  "job_saved",
]

// ── POST: Record an activity event ──────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { job_id, event_type, metadata } = body

    if (!job_id || !event_type) {
      return NextResponse.json(
        { error: "job_id and event_type are required" },
        { status: 400 }
      )
    }

    if (!VALID_EVENT_TYPES.includes(event_type)) {
      return NextResponse.json(
        { error: `Invalid event_type. Must be one of: ${VALID_EVENT_TYPES.join(", ")}` },
        { status: 400 }
      )
    }

    // For job_saved, check if already saved (toggle behavior)
    if (event_type === "job_saved") {
      const existing = await sql`
        SELECT id FROM chrm_activity_events
        WHERE user_id = ${session.user.id}
          AND job_id = ${job_id}
          AND event_type = 'job_saved'
        LIMIT 1
      `
      if (existing.rows.length > 0) {
        // Un-save: remove the record
        await sql`
          DELETE FROM chrm_activity_events
          WHERE user_id = ${session.user.id}
            AND job_id = ${job_id}
            AND event_type = 'job_saved'
        `
        return NextResponse.json({ saved: false, message: "Job unsaved" })
      }
    }

    const metadataJson = metadata ? JSON.stringify(metadata) : "{}"

    const result = await sql`
      INSERT INTO chrm_activity_events (user_id, job_id, event_type, metadata)
      VALUES (${session.user.id}, ${job_id}, ${event_type}, ${metadataJson}::jsonb)
      RETURNING id, user_id, job_id, event_type, created_at
    `

    return NextResponse.json({
      saved: true,
      event: result.rows[0],
    })
  } catch (error) {
    console.error("[CHRM Activity] POST error:", error)
    return NextResponse.json(
      { error: "Failed to record activity", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// ── GET: Query activity events ──────────────────────────────
// ?type=job_saved — user's saved jobs
// ?type=job_viewed — user's viewed jobs
// ?hot_jobs=true — aggregated job_viewed counts (top 20, last 7 days)
// ?user_submissions=true — user's candidate_submitted events
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get("type")
    const hotJobs = searchParams.get("hot_jobs")
    const userSubmissions = searchParams.get("user_submissions")

    // ── Hot Jobs: aggregate job_viewed counts ─────────────────
    if (hotJobs === "true") {
      const result = await sql`
        SELECT
          job_id,
          COUNT(*) AS view_count
        FROM chrm_activity_events
        WHERE event_type = 'job_viewed'
          AND created_at > NOW() - INTERVAL '7 days'
        GROUP BY job_id
        ORDER BY view_count DESC
        LIMIT 20
      `
      return NextResponse.json({ hot_jobs: result.rows })
    }

    // ── User's submissions ───────────────────────────────────
    if (userSubmissions === "true") {
      const result = await sql`
        SELECT job_id, metadata, created_at
        FROM chrm_activity_events
        WHERE user_id = ${session.user.id}
          AND event_type = 'candidate_submitted'
        ORDER BY created_at DESC
        LIMIT 100
      `
      return NextResponse.json({ submissions: result.rows })
    }

    // ── User's saved jobs ────────────────────────────────────
    if (eventType === "job_saved") {
      const result = await sql`
        SELECT job_id, created_at
        FROM chrm_activity_events
        WHERE user_id = ${session.user.id}
          AND event_type = 'job_saved'
        ORDER BY created_at DESC
      `
      return NextResponse.json({
        saved_job_ids: result.rows.map((r) => r.job_id),
      })
    }

    // ── Generic event query ──────────────────────────────────
    if (eventType && VALID_EVENT_TYPES.includes(eventType as CHRMActivityEventType)) {
      const result = await sql`
        SELECT id, job_id, event_type, metadata, created_at
        FROM chrm_activity_events
        WHERE user_id = ${session.user.id}
          AND event_type = ${eventType}
        ORDER BY created_at DESC
        LIMIT 50
      `
      return NextResponse.json({ events: result.rows })
    }

    return NextResponse.json(
      { error: "Specify ?type=<event_type>, ?hot_jobs=true, or ?user_submissions=true" },
      { status: 400 }
    )
  } catch (error) {
    console.error("[CHRM Activity] GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
