import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const CHRM_JOBS_URL = "https://us-central1-chrm-nexus.cloudfunctions.net/getJobs"

/**
 * GET /api/chrm/public-jobs
 *
 * Public (no-auth) proxy for CHRM NEXUS jobs — used by the public /jobs board.
 * Returns a limited set of jobs (max 30) suitable for public display.
 * The CHRM API key stays server-side.
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.CHRM_NEXUS_API_KEY || process.env.CHRM_API_KEY
    if (!apiKey) {
      // Return empty if not configured — public page degrades gracefully
      return NextResponse.json({ jobs: [], total: 0 })
    }

    const { searchParams } = new URL(request.url)

    const params = new URLSearchParams()
    params.set("limit", "30")  // cap for public display
    params.set("sort_by", "posted_date")

    // Forward safe filter params from the client
    const allowed = ["state", "work_model", "keyword", "contract_type", "industry", "seniority_level"]
    for (const key of allowed) {
      const val = searchParams.get(key)
      if (val) params.set(key, val)
    }

    const url = `${CHRM_JOBS_URL}?${params.toString()}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      next: { revalidate: 300 }, // cache for 5 min — reduces CHRM API calls
    })

    if (!response.ok) {
      console.error("[Public CHRM Jobs] Upstream error:", response.status, response.statusText)
      return NextResponse.json({ jobs: [], total: 0 })
    }

    const data = await response.json()

    return NextResponse.json({
      jobs: data.jobs ?? [],
      total: data.total ?? 0,
    })
  } catch (error) {
    console.error("[Public CHRM Jobs] Error:", error)
    // Graceful fallback — public page still works with just manual jobs
    return NextResponse.json({ jobs: [], total: 0 })
  }
}
