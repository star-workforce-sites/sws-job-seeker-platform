import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

// GET /api/jobs/list
// Returns list of active jobs with optional filters, transformed for frontend
// 
// TEMPORARY: Salary displayed as HOURLY RATE (annual / 2080)
// TODO: Change back to annual when database is updated with hourly rates
// See: docs/SALARY-DISPLAY-TRACKING.md

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const industry = searchParams.get("industry")
    const location = searchParams.get("location")
    const employmentType = searchParams.get("employmentType")

    // Base query with JOIN to users table
    // Using sql template literals (required by @vercel/postgres)
    let query = sql`
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
      WHERE j."isActive" = TRUE AND j."expiresAt" > NOW()
    `;

    // Apply filters using template literal chaining
    if (industry) {
      query = sql`${query} AND j.industry = ${industry}`;
    }

    if (location) {
      query = sql`${query} AND j.location ILIKE ${'%' + location + '%'}`;
    }

    if (employmentType) {
      query = sql`${query} AND j."employmentType" = ${employmentType}`;
    }

    // Add ordering and limit
    query = sql`${query} ORDER BY j."createdAt" DESC LIMIT 50`;

    const result = await query;

    // Transform to match frontend interface
    const jobs = result.rows.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      employmentType: job.employmentType,
      salary: job.salary,
      description: job.description,
      postedDate: job.postedDate,
      remoteType: job.remoteType
    }));

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("[Jobs API] Error fetching jobs:", error);
    return NextResponse.json({ 
      error: "Failed to fetch jobs",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
