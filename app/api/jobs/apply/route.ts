import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// POST /api/jobs/apply
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { jobId, notes } = await request.json()

    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 })
    }

    // Check daily application limit (5 free applications per day)
    const today = new Date().toISOString().split("T")[0]
    const limitCheck = await sql`
      SELECT count FROM application_limits
      WHERE "userId" = ${session.user.id} AND date = ${today}
    `

    const currentCount = limitCheck.rows[0]?.count || 0

    // Allow unlimited if user has premium (atsPremium = true)
    const userCheck = await sql`
      SELECT "atsPremium" FROM users WHERE id = ${session.user.id}
    `
    const isPremium = userCheck.rows[0]?.atsPremium || false

    if (!isPremium && currentCount >= 5) {
      return NextResponse.json(
        {
          error: "Daily application limit reached",
          message: "Free users can apply to 5 jobs per day. Upgrade to premium for unlimited applications.",
          limit: 5,
          used: currentCount,
        },
        { status: 429 },
      )
    }

    // Check if already applied
    const existingApplication = await sql`
      SELECT id FROM applications
      WHERE "userId" = ${session.user.id} AND "jobId" = ${jobId}
    `

    if (existingApplication.rows.length > 0) {
      return NextResponse.json({ error: "Already applied to this job" }, { status: 409 })
    }

    // Create application
    const result = await sql`
      INSERT INTO applications ("userId", "jobId", notes, status)
      VALUES (${session.user.id}, ${jobId}, ${notes || null}, 'applied')
      RETURNING id, "appliedAt"
    `

    // Update or create daily limit counter
    await sql`
      INSERT INTO application_limits ("userId", date, count)
      VALUES (${session.user.id}, ${today}, 1)
      ON CONFLICT ("userId", date)
      DO UPDATE SET count = application_limits.count + 1
    `

    return NextResponse.json({
      success: true,
      applicationId: result.rows[0].id,
      appliedAt: result.rows[0].appliedAt,
      dailyCount: currentCount + 1,
      dailyLimit: isPremium ? "unlimited" : 5,
    })
  } catch (error) {
    console.error("[ERROR] Application submission failed:", error)
    return NextResponse.json(
      { error: "Failed to submit application", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// GET /api/jobs/apply - Get user's applications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") // Filter by status
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = `
      SELECT 
        a.id,
        a.status,
        a."appliedAt",
        a."updatedAt",
        a.notes,
        j.id as "jobId",
        j.title,
        j.description,
        j.location,
        j."employmentType",
        j.industry,
        j."salaryMin",
        j."salaryMax"
      FROM applications a
      JOIN jobs j ON a."jobId" = j.id
      WHERE a."userId" = $1
    `

    const values: any[] = [session.user.id]

    if (status) {
      query += ` AND a.status = $${values.length + 1}`
      values.push(status)
    }

    query += ` ORDER BY a."appliedAt" DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`
    values.push(limit, offset)

    const result = await sql.query(query, values)

    return NextResponse.json({
      applications: result.rows,
      pagination: {
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error("[ERROR] Failed to fetch applications:", error)
    return NextResponse.json(
      { error: "Failed to fetch applications", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
