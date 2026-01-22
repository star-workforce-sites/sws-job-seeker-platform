import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

// Force Node.js runtime for database connections
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/jobs/[id]
// Returns single job details with same format as /api/jobs/list
// Matches frontend Job type exactly

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id

    // Exact same query as /list but for single job
    // Uses same JOIN, same salary calculation, same transformations
    const result = await sql`
      SELECT 
        j.id,
        j.title,
        COALESCE(u.name, 'Anonymous Employer') as company,
        j.location,
        j."employmentType",
        CASE 
          WHEN j."salaryMin" IS NOT NULL AND j."salaryMax" IS NOT NULL 
          THEN '$' || ROUND(j."salaryMin"::numeric / 2080, 2) || '/hr - $' || ROUND(j."salaryMax"::numeric / 2080, 2) || '/hr'
          WHEN j."salaryMin" IS NOT NULL 
          THEN '$' || ROUND(j."salaryMin"::numeric / 2080, 2) || '/hr+'
          ELSE 'Competitive'
        END as salary,
        j.description,
        TO_CHAR(j."createdAt", 'YYYY-MM-DD') as "postedDate",
        CASE 
          WHEN j.location ILIKE '%remote%' THEN 'remote'
          WHEN j.location ILIKE '%hybrid%' THEN 'hybrid'
          ELSE 'onsite'
        END as "remoteType"
      FROM jobs j
      LEFT JOIN users u ON j."employerId" = u.id
      WHERE j.id = ${jobId} AND j."isActive" = TRUE AND j."expiresAt" > NOW()
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    // Transform to match frontend interface (same as /list)
    const job = {
      id: result.rows[0].id,
      title: result.rows[0].title,
      company: result.rows[0].company,
      location: result.rows[0].location,
      employmentType: result.rows[0].employmentType,
      salary: result.rows[0].salary,
      description: result.rows[0].description,
      postedDate: result.rows[0].postedDate,
      remoteType: result.rows[0].remoteType
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error("[Job Detail API] Error fetching job:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch job",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
