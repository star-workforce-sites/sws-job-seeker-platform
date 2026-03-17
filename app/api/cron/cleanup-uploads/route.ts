import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getDbUrl } from "@/lib/db"

// GET /api/cron/cleanup-uploads
// Cron job to auto-delete uploaded files after 30 days for privacy compliance
// Runs daily via Vercel Cron

export const dynamic = "force-dynamic"
export const revalidate = 0

const sql = neon(getDbUrl())

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[CLEANUP] Starting upload cleanup cron job")

    // Delete expired resume uploads (expiresAt column already set to uploadedAt + 30 days)
    const resumeResult = await sql`
      DELETE FROM resume_uploads
      WHERE "expiresAt" < NOW()
      RETURNING id
    `
    const resumeCount = resumeResult.length

    // Delete cover letter uploads older than 30 days (no expiresAt column, use uploaded_at)
    const coverLetterResult = await sql`
      DELETE FROM cover_letter_uploads
      WHERE uploaded_at < NOW() - INTERVAL '30 days'
      RETURNING id
    `
    const coverLetterCount = coverLetterResult.length

    console.log(
      `[CLEANUP] Deleted ${resumeCount} expired resume uploads, ${coverLetterCount} expired cover letter uploads`
    )

    return NextResponse.json({
      success: true,
      message: `Cleanup complete`,
      deleted: {
        resumeUploads: resumeCount,
        coverLetterUploads: coverLetterCount,
      },
    })
  } catch (error: any) {
    console.error("[CLEANUP] Error in cleanup cron job:", error)
    return NextResponse.json(
      { error: "Cleanup cron job failed", details: error?.message || String(error) },
      { status: 500 }
    )
  }
}
