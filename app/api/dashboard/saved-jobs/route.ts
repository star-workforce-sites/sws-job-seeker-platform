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

    const result = await sql`
      SELECT "jobId"
      FROM saved_jobs
      WHERE "userId" = ${userId}
    `

    return NextResponse.json({ savedJobs: result.rows })
  } catch (error: any) {
    console.error("[ERROR REPORT] Saved Jobs Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch saved jobs",
        details: error?.message || String(error),
      },
      { status: 500 },
    )
  }
}
