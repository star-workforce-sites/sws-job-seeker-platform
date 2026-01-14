import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

// GET /api/jobs/search?q=engineer&workType=remote&jobType=senior&location=USA
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""
    const workType = searchParams.get("workType") // remote, hybrid, onsite
    const jobType = searchParams.get("jobType") // entry, mid, senior
    const location = searchParams.get("location")
    const visa = searchParams.get("visa") // Optional: filter by visa sponsorship
    const industry = searchParams.get("industry")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Build dynamic WHERE clause
    const conditions: string[] = ['j."isActive" = true']
    const values: any[] = []
    let paramIndex = 1

    // Full-text search on title and description
    if (query) {
      conditions.push(`(
        j.title ILIKE $${paramIndex} OR 
        j.description ILIKE $${paramIndex} OR
        j.industry ILIKE $${paramIndex}
      )`)
      values.push(`%${query}%`)
      paramIndex++
    }

    // Filter by work type (employment type)
    if (workType && workType !== "all") {
      conditions.push(`j."employmentType" ILIKE $${paramIndex}`)
      values.push(`%${workType}%`)
      paramIndex++
    }

    // Filter by seniority level (stored in title typically)
    if (jobType && jobType !== "all") {
      conditions.push(`j.title ILIKE $${paramIndex}`)
      values.push(`%${jobType}%`)
      paramIndex++
    }

    // Filter by location
    if (location && location !== "all") {
      conditions.push(`j.location ILIKE $${paramIndex}`)
      values.push(`%${location}%`)
      paramIndex++
    }

    // Filter by visa sponsorship
    if (visa && visa !== "all") {
      conditions.push(`j.visa ILIKE $${paramIndex}`)
      values.push(`%${visa}%`)
      paramIndex++
    }

    // Filter by industry
    if (industry && industry !== "all") {
      conditions.push(`j.industry ILIKE $${paramIndex}`)
      values.push(`%${industry}%`)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    // Execute query with pagination
    const result = await sql.query(
      `
      SELECT 
        j.id,
        j.title,
        j.description,
        j.location,
        j."employmentType",
        j.industry,
        j.visa,
        j."salaryMin",
        j."salaryMax",
        j."createdAt",
        j."expiresAt",
        (SELECT COUNT(*) FROM jobs WHERE ${conditions.join(" AND ")}) as total_count
      FROM jobs j
      ${whereClause}
      ORDER BY j."createdAt" DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `,
      [...values, limit, offset],
    )

    const jobs = result.rows
    const totalCount = jobs.length > 0 ? Number.parseInt(jobs[0].total_count) : 0

    return NextResponse.json({
      jobs: jobs.map((job) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        employmentType: job.employmentType,
        industry: job.industry,
        visa: job.visa,
        salaryRange:
          job.salaryMin && job.salaryMax
            ? `$${(job.salaryMin / 1000).toFixed(0)}K - $${(job.salaryMax / 1000).toFixed(0)}K`
            : "Competitive",
        createdAt: job.createdAt,
        expiresAt: job.expiresAt,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("[ERROR] Job search failed:", error)
    return NextResponse.json(
      { error: "Failed to search jobs", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
