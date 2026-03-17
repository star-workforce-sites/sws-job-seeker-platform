export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { generateATSAnalysis } from "@/lib/ats-ai-analysis"

export async function POST(request: NextRequest) {
  try {
    const requestId = crypto.randomUUID()
    console.log(`[ATS ${requestId}] Fresh request – no cache`)

    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get("resumeId")
    const email = searchParams.get("email")

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID required" }, { status: 400 })
    }

    console.log(`[ATS ${requestId}] Resume ID:`, resumeId, "Email:", email, "Timestamp:", new Date().toISOString())

    const hasPremiumCookie = request.cookies.get("atsPremium")?.value === "true"
    let hasPremiumDB = false

    if (email && !hasPremiumCookie) {
      console.log(`[ATS ${requestId}] Checking premium access for email:`, email)

      const premiumCheck = await sql`
        SELECT id, email, "stripeCustomerId", "paidAt" 
        FROM premium_access
        WHERE LOWER(email) = LOWER(${email})
        AND "priceId" = ${process.env.STRIPE_PRICE_ATS_OPTIMIZER!}
        LIMIT 1
      `

      hasPremiumDB = premiumCheck.rows.length > 0

      if (hasPremiumDB) {
        console.log(`[ATS ${requestId}] Premium access CONFIRMED for ${email}`)
      } else {
        console.log(`[ATS ${requestId}] No premium access found for ${email}`)
      }
    }

    if (!hasPremiumCookie && !hasPremiumDB) {
      console.log(`[ATS ${requestId}] Access DENIED - no premium cookie or database record`)
      return NextResponse.json({ error: "Premium access required" }, { status: 403 })
    }

    console.log(`[ATS ${requestId}] Access GRANTED - proceeding with full analysis`)

    const result = await sql`
      SELECT "fileContent", "fileType", "fileName", "analysisCache"
      FROM resume_uploads
      WHERE id = ${resumeId}
      LIMIT 1
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    const resume = result.rows[0]

    // Check for cached analysis first
    if (resume.analysisCache) {
      try {
        const cached = typeof resume.analysisCache === 'string'
          ? JSON.parse(resume.analysisCache)
          : resume.analysisCache
        if (cached && cached.score && cached.keywords) {
          console.log(`[ATS ${requestId}] Returning CACHED AI analysis`)
          cached.isPremium = true
          const response = NextResponse.json(cached)
          response.headers.set(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          )
          response.headers.set("Pragma", "no-cache")
          response.headers.set("Expires", "0")
          response.headers.set("X-Vercel-Cache", "MISS")
          response.headers.set("CDN-Cache-Control", "no-store")
          response.headers.set("Surrogate-Control", "no-store")
          response.headers.set("X-Request-ID", requestId)
          return response
        }
      } catch (e) {
        console.log(`[ATS ${requestId}] Cache parse failed, regenerating`)
      }
    }

    // Extract text from resume
    let resumeText = ''
    try {
      const buffer = Buffer.from(resume.fileContent, 'base64')
      resumeText = buffer.toString('utf-8')
      // Clean up non-printable characters
      resumeText = resumeText.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim()
    } catch (e) {
      console.error(`[ATS ${requestId}] Text extraction failed:`, e)
      resumeText = 'Unable to extract text from resume'
    }

    // Generate AI analysis
    console.log(`[ATS ${requestId}] Generating AI analysis (${resumeText.length} chars)`)
    const analysis = await generateATSAnalysis(resumeText)

    // Cache the result
    try {
      await sql`
        UPDATE resume_uploads
        SET "analysisCache" = ${JSON.stringify(analysis)}::jsonb
        WHERE id = ${resumeId}
      `
      console.log(`[ATS ${requestId}] Analysis cached`)
    } catch (e) {
      console.error(`[ATS ${requestId}] Cache write failed:`, e)
    }

    const fullResult = analysis

    console.log(`[ATS ${requestId}] Analysis complete. Score:`, analysis.score)

    const response = NextResponse.json(fullResult)

    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
    )
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("X-Vercel-Cache", "MISS")
    response.headers.set("CDN-Cache-Control", "no-store")
    response.headers.set("Surrogate-Control", "no-store")
    response.headers.set("X-Request-ID", requestId)

    console.log(`[ATS ${requestId}] Response sent with score ${analysis.score}`)

    return response
  } catch (error: any) {
    console.error(`[ATS ERROR] Full Analysis Error:`, error)
    return NextResponse.json(
      {
        error: "Analysis failed",
        details: error?.message || String(error),
        code: error?.code,
      },
      { status: 500 },
    )
  }
}
