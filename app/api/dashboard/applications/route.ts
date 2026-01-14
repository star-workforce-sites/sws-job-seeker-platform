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
      SELECT 
        a.id,
        a.status,
        a."appliedAt",
        j.title,
        j.company,
        j.location
      FROM applications a
      JOIN jobs j ON a."jobId" = j.id
      WHERE a."userId" = ${userId}
      ORDER BY a."appliedAt" DESC
      LIMIT 50
    `

    return NextResponse.json({ applications: result.rows })
  } catch (error: any) {
    console.error("[ERROR REPORT] Applications List Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch applications",
        details: error?.message || String(error),
      },
      { status: 500 },
    )
  }
}
