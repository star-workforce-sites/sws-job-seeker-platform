import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"

export const dynamic = "force-dynamic"

/**
 * GET /api/resume/list
 * Returns the current user's uploaded resumes from resume_uploads.
 * Only returns non-expired resumes with a fileName.
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ resumes: [] }, { status: 401 })
    }

    const result = await sql`
      SELECT
        id,
        "fileName",
        "uploadedAt",
        "expiresAt"
      FROM resume_uploads
      WHERE (
        "userId" = ${session.user.id}::uuid
        OR LOWER(email) = LOWER(${session.user.email})
      )
        AND "fileName" IS NOT NULL
        AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
      ORDER BY "uploadedAt" DESC
      LIMIT 10
    `

    const resumes = result.rows.map((r) => ({
      id: r.id,
      fileName: r.fileName,
      uploadedAt: r.uploadedAt,
    }))

    return NextResponse.json({ resumes })
  } catch (error) {
    console.error("[Resume List] Error:", error)
    return NextResponse.json({ resumes: [] })
  }
}
