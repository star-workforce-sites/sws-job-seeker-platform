import { type NextRequest, NextResponse } from "next/server"
import { getActiveJobs } from "@/lib/db"

// GET /api/jobs/list
// Returns list of active jobs with optional filters

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const industry = searchParams.get("industry") || undefined
    const location = searchParams.get("location") || undefined
    const employmentType = searchParams.get("employmentType") || undefined

    const jobs = await getActiveJobs({
      industry,
      location,
      employmentType,
    })

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("[v0] Error fetching jobs:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}
