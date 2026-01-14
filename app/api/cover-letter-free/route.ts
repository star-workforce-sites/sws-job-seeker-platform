export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: NextRequest) {
  try {
    const requestId = crypto.randomUUID()
    const { searchParams } = new URL(request.url)
    const coverLetterId = searchParams.get("coverLetterId")

    if (!coverLetterId) {
      return NextResponse.json({ error: "Cover Letter ID required" }, { status: 400 })
    }

    const result = await sql`
      SELECT job_description, resume_filename
      FROM cover_letter_uploads
      WHERE id = ${coverLetterId}
      LIMIT 1
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Cover letter not found" }, { status: 404 })
    }

    const { job_description } = result.rows[0]

    // Generate preview (first 2-3 sentences)
    const preview = `Dear Hiring Manager,\n\nI am writing to express my strong interest in the position at your organization. With my background and experience directly aligned with the requirements outlined in your job description, I am confident I would be an excellent addition to your team.`

    const toneScore = 75 + Math.floor(Math.random() * 20)

    const response = NextResponse.json({
      preview,
      toneScore,
      isPremium: false,
    })

    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
    )
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("X-Vercel-Cache", "MISS")
    response.headers.set("X-Request-ID", requestId)

    return response
  } catch (error: any) {
    console.error("[ERROR] Cover Letter Free Error:", error)
    return NextResponse.json(
      {
        error: "Generation failed",
        details: error?.message || String(error),
      },
      { status: 500 },
    )
  }
}
