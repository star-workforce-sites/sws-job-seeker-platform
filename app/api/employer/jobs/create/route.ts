import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/session"
import { createJob, getEmployerActiveJobCount } from "@/lib/db"

// POST /api/employer/jobs/create
// Employers create new job postings

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole("employer")

    // Check active job limit
    const activeCount = await getEmployerActiveJobCount(user.id)
    if (activeCount >= 5) {
      return NextResponse.json({ error: "Maximum 5 active jobs allowed" }, { status: 400 })
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = ["title", "description", "location", "industry"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Validate employment type
    const employmentType = body.employmentType || "contract"
    if (!["consulting", "contract"].includes(employmentType)) {
      return NextResponse.json({ error: "Employment type must be consulting or contract" }, { status: 400 })
    }

    const job = await createJob({
      employerId: user.id,
      title: body.title,
      description: body.description,
      location: body.location,
      industry: body.industry,
      employmentType,
      visa: body.visa,
      salaryMin: body.salaryMin ? Number.parseInt(body.salaryMin) : undefined,
      salaryMax: body.salaryMax ? Number.parseInt(body.salaryMax) : undefined,
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
