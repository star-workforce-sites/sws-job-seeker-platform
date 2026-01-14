import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { jobId } = await request.json()
    const userId = session.user.id

    await sql`
      INSERT INTO saved_jobs ("userId", "jobId")
      VALUES (${userId}, ${jobId})
      ON CONFLICT DO NOTHING
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[ERROR REPORT] Save Job Error:", error)
    return NextResponse.json(
      {
        error: "Failed to save job",
        details: error?.message || String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { jobId } = await request.json()
    const userId = session.user.id

    await sql`
      DELETE FROM saved_jobs
      WHERE "userId" = ${userId} AND "jobId" = ${jobId}
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[ERROR REPORT] Unsave Job Error:", error)
    return NextResponse.json(
      {
        error: "Failed to unsave job",
        details: error?.message || String(error),
      },
      { status: 500 },
    )
  }
}
