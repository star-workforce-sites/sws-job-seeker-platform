import { type NextRequest, NextResponse } from "next/server"
import { expireOldJobs } from "@/lib/db"

// GET /api/cron/expire-jobs
// Cron job to auto-expire jobs after 30 days
// Runs daily via Vercel Cron

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await expireOldJobs()

    return NextResponse.json({
      success: true,
      message: "Expired old jobs",
    })
  } catch (error) {
    console.error("[v0] Error in cron job:", error)
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 })
  }
}
