import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get application stats
    const applicationsResult = await sql`
      SELECT COUNT(*) as total
      FROM applications
      WHERE "userId" = ${userId}
    `

    // Get saved jobs count
    const savedJobsResult = await sql`
      SELECT COUNT(*) as total
      FROM saved_jobs
      WHERE "userId" = ${userId}
    `

    // Get today's applications count
    const todayApplicationsResult = await sql`
      SELECT COUNT(*) as total
      FROM applications
      WHERE "userId" = ${userId}
      AND "appliedAt"::date = CURRENT_DATE
    `

    // Get interview count (applications with status 'interview')
    const interviewsResult = await sql`
      SELECT COUNT(*) as total
      FROM applications
      WHERE "userId" = ${userId}
      AND status = 'interview'
    `

    // Check premium status
    const userResult = await sql`
      SELECT "atsPremium"
      FROM users
      WHERE id = ${userId}
    `

    const stats = {
      totalApplications: Number(applicationsResult.rows[0]?.total || 0),
      savedJobs: Number(savedJobsResult.rows[0]?.total || 0),
      interviews: Number(interviewsResult.rows[0]?.total || 0),
      applicationsToday: Number(todayApplicationsResult.rows[0]?.total || 0),
      isPremium: userResult.rows[0]?.atsPremium || false,
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error("[ERROR REPORT] Dashboard Stats Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        details: error?.message || String(error),
      },
      { status: 500 },
    )
  }
}
