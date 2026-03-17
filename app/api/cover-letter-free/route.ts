export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { generateCoverLetter } from "@/lib/cover-letter-ai"

export async function POST(request: NextRequest) {
  try {
    const requestId = crypto.randomUUID()
    const { searchParams } = new URL(request.url)
    const coverLetterId = searchParams.get("coverLetterId")

    if (!coverLetterId) {
      return NextResponse.json({ error: "Cover Letter ID required" }, { status: 400 })
    }

    console.log(`[COVER-FREE ${requestId}] Request for coverLetterId:`, coverLetterId)

    const result = await sql`
      SELECT job_description, resume_url, resume_filename, generated_cover_letter
      FROM cover_letter_uploads
      WHERE id = ${coverLetterId}
      LIMIT 1
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Cover letter not found" }, { status: 404 })
    }

    const { job_description, resume_url, generated_cover_letter } = result.rows[0]

    // Check for cached generated cover letter
    let coverLetterData = null
    if (generated_cover_letter) {
      try {
        coverLetterData = typeof generated_cover_letter === 'string'
          ? JSON.parse(generated_cover_letter)
          : generated_cover_letter
        if (coverLetterData && coverLetterData.coverLetter) {
          console.log(`[COVER-FREE ${requestId}] Using CACHED AI cover letter`)
        } else {
          coverLetterData = null
        }
      } catch (e) {
        console.log(`[COVER-FREE ${requestId}] Cache parse failed, regenerating`)
        coverLetterData = null
      }
    }

    // If no cache, generate fresh AI cover letter
    if (!coverLetterData) {
      console.log(`[COVER-FREE ${requestId}] Generating FRESH AI cover letter`)

      // Fetch resume text from blob URL
      let resumeText = ''
      try {
        if (resume_url) {
          const res = await fetch(resume_url)
          const buffer = await res.arrayBuffer()
          resumeText = Buffer.from(buffer).toString('utf-8')
          resumeText = resumeText.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim()
        }
      } catch (e) {
        console.error(`[COVER-FREE ${requestId}] Resume fetch failed:`, e)
        resumeText = 'Resume content unavailable'
      }

      coverLetterData = await generateCoverLetter(resumeText, job_description || '')

      // Cache the result for reuse by the full route
      try {
        await sql`
          UPDATE cover_letter_uploads
          SET generated_cover_letter = ${JSON.stringify(coverLetterData)}
          WHERE id = ${coverLetterId}
        `
        console.log(`[COVER-FREE ${requestId}] Cover letter cached`)
      } catch (e) {
        console.error(`[COVER-FREE ${requestId}] Cache write failed:`, e)
      }
    }

    // Return only the preview (first paragraph + partial second)
    const fullText = coverLetterData.coverLetter || ''
    const paragraphs = fullText.split(/\n\n/)
    const preview = paragraphs.slice(0, 2).join('\n\n')

    console.log(`[COVER-FREE ${requestId}] Returning preview (${preview.length} chars of ${fullText.length})`)

    const response = NextResponse.json({
      preview,
      toneScore: coverLetterData.toneScore || 82,
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
