export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { generateCoverLetter } from "@/lib/cover-letter-ai"

const COVER_LETTER_PRICE_ID = process.env.STRIPE_PRICE_COVER_LETTER!

export async function POST(request: NextRequest) {
  try {
    const requestId = crypto.randomUUID()
    const { searchParams } = new URL(request.url)
    const coverLetterId = searchParams.get("coverLetterId")
    const email = searchParams.get("email")

    console.log(`[COVER-FULL ${requestId}] Request for coverLetterId:`, coverLetterId, "email:", email)

    if (!coverLetterId) {
      return NextResponse.json({ error: "Cover Letter ID required" }, { status: 400 })
    }

    // Premium access check
    const premiumCheck = await sql`
      SELECT id, email FROM premium_access
      WHERE LOWER(email) = LOWER(${email})
      AND "priceId" = ${COVER_LETTER_PRICE_ID}
      LIMIT 1
    `

    if (premiumCheck.rows.length === 0) {
      console.log(`[COVER-FULL ${requestId}] Access DENIED - no Cover Letter premium for:`, email)
      return NextResponse.json({ error: "Premium access required", requiresPayment: true }, { status: 403 })
    }

    console.log(`[COVER-FULL ${requestId}] Premium access confirmed`)

    // Fetch cover letter data
    const result = await sql`
      SELECT job_description, resume_url, resume_filename, generated_cover_letter
      FROM cover_letter_uploads
      WHERE id = ${coverLetterId}
      LIMIT 1
    `

    if (result.rows.length === 0) {
      console.error(`[COVER-FULL ${requestId}] Cover letter not found:`, coverLetterId)
      return NextResponse.json({ error: "Cover letter data not found" }, { status: 404 })
    }

    const { job_description, resume_url, generated_cover_letter } = result.rows[0]

    if (!job_description || job_description.trim().length === 0) {
      console.error(`[COVER-FULL ${requestId}] Missing job description`)
      return NextResponse.json({ error: "Upload resume and job description first." }, { status: 400 })
    }

    // Check for cached AI cover letter
    let coverLetterData = null
    if (generated_cover_letter) {
      try {
        coverLetterData = typeof generated_cover_letter === 'string'
          ? JSON.parse(generated_cover_letter)
          : generated_cover_letter
        if (coverLetterData && coverLetterData.coverLetter) {
          console.log(`[COVER-FULL ${requestId}] Using CACHED AI cover letter`)
        } else {
          coverLetterData = null
        }
      } catch (e) {
        console.log(`[COVER-FULL ${requestId}] Cache parse failed, regenerating`)
        coverLetterData = null
      }
    }

    // If no cache, generate fresh AI cover letter
    if (!coverLetterData) {
      console.log(`[COVER-FULL ${requestId}] Generating FRESH AI cover letter`)

      let resumeText = ''
      try {
        if (resume_url) {
          const res = await fetch(resume_url)
          const buffer = await res.arrayBuffer()
          resumeText = Buffer.from(buffer).toString('utf-8')
          resumeText = resumeText.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim()
        }
      } catch (e) {
        console.error(`[COVER-FULL ${requestId}] Resume fetch failed:`, e)
        resumeText = 'Resume content unavailable'
      }

      coverLetterData = await generateCoverLetter(resumeText, job_description)

      // Cache the result
      try {
        await sql`
          UPDATE cover_letter_uploads
          SET generated_cover_letter = ${JSON.stringify(coverLetterData)}
          WHERE id = ${coverLetterId}
        `
        console.log(`[COVER-FULL ${requestId}] Cover letter cached`)
      } catch (e) {
        console.error(`[COVER-FULL ${requestId}] Cache write failed:`, e)
      }
    }

    console.log(`[COVER-FULL ${requestId}] Successfully returning full cover letter`)

    const response = NextResponse.json({
      coverLetter: coverLetterData.coverLetter,
      toneScore: coverLetterData.toneScore || 85,
      isPremium: true,
    })

    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
    )
    response.headers.set("Pragma", "no-cache")
    response.headers.set("X-Vercel-Cache", "MISS")
    response.headers.set("X-Request-ID", requestId)

    return response
  } catch (error: any) {
    const errorId = crypto.randomUUID()
    console.error(`[COVER-GEN ERROR ${errorId}]`, error.message, error.stack)
    return NextResponse.json(
      {
        error: "Generation failed — try again or contact support.",
        errorId,
        details: error?.message || String(error),
      },
      { status: 500 },
    )
  }
}
