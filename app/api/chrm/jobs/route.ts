import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { CHRMJobsResponse } from "@/types/chrm-nexus"

export const dynamic = "force-dynamic"

const CHRM_JOBS_URL =
  "https://us-central1-chrm-nexus.cloudfunctions.net/getJobs"

// -- Aggregator filter (stopgap, added 2026-09-06) --------------
// CHRM NEXUS's getJobs feed includes listings sourced from third-party job
// AGGREGATORS (meta-search sites that re-post other sites' listings, not
// actual employers). Applying to these routes to the aggregator's own
// generic mailbox (e.g. Careerjet's applyToJob response returned
// "jobalert@careerjet.com" for a "Careerjet" listing) instead of a real
// recruiter/company contact, wasting the candidate's application. Several
// aggregators keep reappearing under slightly different names even after
// being unsubscribed from directly, so this list is matched by substring,
// and a generic-alert-email pattern catches ones not yet named below.
// This is a client-side stopgap until CHRM NEXUS excludes or flags
// aggregator-sourced / generic-alert-email listings upstream -- see the
// bug report sent to CHRM NEXUS, Sept 2026. Remove once CHRM NEXUS
// confirms a permanent fix on their side.
const AGGREGATOR_COMPANY_BLOCKLIST = [
  "careerjet",
  "indeed",
  "ziprecruiter",
  "simplyhired",
  "jooble",
  "adzuna",
  "trovit",
  "jobrapido",
  "linkup",
  "jobisjob",
  "talent.com",
  "neuvoo",
  "jora",
  "recruit.net",
  "google jobs",
  "getwork",
  "whatjobs",
  "jobg8",
  "jobsora",
]

// A real recruiter's email almost never looks like this -- catches
// aggregators not yet in the name list above.
const GENERIC_ALERT_EMAIL_PATTERN = /^(jobalert|job-alert|jobs-noreply|noreply|no-reply|alerts?|notifications?|do-not-reply)@/i

function isAggregatorListing(companyName: string | null | undefined, employerEmail?: string | null): boolean {
  const normalizedCompany = (companyName || "").trim().toLowerCase()
  const byName = normalizedCompany
    ? AGGREGATOR_COMPANY_BLOCKLIST.some(
        (blocked) => normalizedCompany === blocked || normalizedCompany.includes(blocked)
      )
    : false
  const byEmail = employerEmail ? GENERIC_ALERT_EMAIL_PATTERN.test(employerEmail.trim()) : false
  return byName || byEmail
}

export async function GET(request: NextRequest) {
  try {
    // Auth required — only logged-in users can query the job board
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Support both env var names (CHRM_NEXUS_API_KEY is the canonical name per integration guide)
    const apiKey = process.env.CHRM_NEXUS_API_KEY || process.env.CHRM_API_KEY
    if (!apiKey) {
      console.error("[CHRM Jobs] Neither CHRM_NEXUS_API_KEY nor CHRM_API_KEY configured")
      return NextResponse.json(
        { error: "Job board service not configured — API key missing" },
        { status: 503 }
      )
    }

    // Forward allowed query params to CHRM NEXUS
    const { searchParams } = new URL(request.url)
    const params = new URLSearchParams()

    // Forward all supported query params to CHRM NEXUS
    const allowedParams = [
      "limit", "offset", "state", "work_model", "skills", "min_score",
      "contract_type", "industry", "seniority_level", "keyword",
      "company_name", "posted_after", "sort_by",
    ]
    for (const key of allowedParams) {
      const val = searchParams.get(key)
      if (val) params.set(key, val)
    }

    const url = `${CHRM_JOBS_URL}?${params.toString()}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      // No caching — always fresh data
      cache: "no-store",
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error(
        "[CHRM Jobs] API error:",
        response.status,
        responseText.substring(0, 500)
      )
      return NextResponse.json(
        { error: `Failed to fetch jobs from provider (${response.status})` },
        { status: 502 }
      )
    }

    let data: CHRMJobsResponse
    try {
      data = JSON.parse(responseText)
    } catch {
      console.error("[CHRM Jobs] Invalid JSON response:", responseText.substring(0, 500))
      return NextResponse.json(
        { error: "Invalid response from job provider" },
        { status: 502 }
      )
    }

    const rawJobs = data.jobs ?? []
    const filteredJobs = rawJobs.filter((job) => !isAggregatorListing(job.company_name, job.employer_email))
    const removedCount = rawJobs.length - filteredJobs.length
    if (removedCount > 0) {
      console.log(`[CHRM Jobs] Filtered out ${removedCount} aggregator-sourced listing(s) this page`)
    }

    const filteredData: CHRMJobsResponse = {
      ...data,
      jobs: filteredJobs,
      count: filteredJobs.length,
      // NOTE: `total` still reflects CHRM NEXUS's unfiltered feed size since it is
      // computed upstream -- this can slightly overstate the true available count
      // until CHRM NEXUS filters aggregator listings out of `total` as well.
    }

    console.log("[CHRM Jobs] Success:", { total: filteredData.total, count: filteredData.count, jobsReturned: filteredData.jobs?.length ?? 0 })

    return NextResponse.json(filteredData)
  } catch (error) {
    console.error("[CHRM Jobs] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch jobs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
