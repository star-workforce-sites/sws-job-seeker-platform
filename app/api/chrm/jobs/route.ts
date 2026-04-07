import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { CHRMJobsResponse } from "@/types/chrm-nexus"

export const dynamic = "force-dynamic"

const CHRM_JOBS_URL =
  "https://us-central1-chrm-nexus.cloudfunctions.net/getJobs"

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
        { error: `Failed to fetch jobs from provider (${response.status})`, details: responseText.substring(0, 200) },
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

    console.log("[CHRM Jobs] Success:", { total: data.total, count: data.count, jobsReturned: data.jobs?.length ?? 0 })

    return NextResponse.json(data)
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
