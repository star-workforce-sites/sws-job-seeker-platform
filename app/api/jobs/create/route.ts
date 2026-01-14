import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/session"
import { createJob, getEmployerActiveJobCount } from "@/lib/db"

// POST /api/jobs/create
// Creates a new job posting (employers only, max 5 active jobs)

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole("employer")

    // Check active job count
    const activeCount = await getEmployerActiveJobCount(user.id)
    if (activeCount >= 5) {
      return NextResponse.json(
        { error: "Maximum of 5 active jobs allowed. Please deactivate an existing job first." },
        { status: 400 },
      )
    }

    const body = await request.json()
    const { title, description, location, industry, employmentType, visa, salaryMin, salaryMax } = body

    // Validation
    if (!title || !description || !location || !industry) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Ensure employment type is consulting or contract only
    if (employmentType && !["consulting", "contract"].includes(employmentType)) {
      return NextResponse.json({ error: "Employment type must be consulting or contract" }, { status: 400 })
    }

    const job = await createJob({
      employerId: user.id,
      title,
      description,
      location,
      industry,
      employmentType: employmentType || "contract",
      visa,
      salaryMin: salaryMin ? Number.parseInt(salaryMin) : undefined,
      salaryMax: salaryMax ? Number.parseInt(salaryMax) : undefined,
    })

    if (!job) {
      return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
    }

    return NextResponse.json({ job }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating job:", error)

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
