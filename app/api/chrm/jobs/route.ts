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

    const apiKey = process.env.CHRM_API_KEY
    if (!apiKey) {
      console.error("[CHRM Jobs] CHRM_API_KEY not configured")
      return NextResponse.json(
        { error: "Job board service not configured" },
        { status: 503 }
      )
    }

    // Forward allowed query params to CHRM NEXUS
    const { searchParams } = new URL(request.url)
    const params = new URLSearchParams()

    const limit = searchParams.get("limit")
    const offset = searchParams.get("offset")
    const state = searchParams.get("state")
    const work_model = searchParams.get("work_model")
    const skills = searchParams.get("skills")
    const min_score = searchParams.get("min_score")
    const contract_type = searchParams.get("contract_type")

    if (limit) params.set("limit", limit)
    if (offset) params.set("offset", offset)
    if (state) params.set("state", state)
    if (work_model) params.set("work_model", work_model)
    if (skills) params.set("skills", skills)
    if (min_score) params.set("min_score", min_score)
    if (contract_type) params.set("contract_type", contract_type)

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

    if (!response.ok) {
      console.error(
        "[CHRM Jobs] API error:",
        response.status,
        await response.text()
      )
      return NextResponse.json(
        { error: "Failed to fetch jobs from provider" },
        { status: 502 }
      )
    }

    const data: CHRMJobsResponse = await response.json()

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
