import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { sql } from "@vercel/postgres"

// GET /api/user/resumes
// Returns current user's uploaded resumes

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`
      SELECT * FROM resumes
      WHERE "userId" = ${user.id}
      ORDER BY "createdAt" DESC
    `

    return NextResponse.json({ resumes: result.rows })
  } catch (error) {
    console.error("[v0] Error fetching resumes:", error)
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 })
  }
}
