export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { generateATSAnalysis } from "@/lib/ats-ai-analysis"

export async function POST(request: NextRequest) {
  try {
    const requestId = crypto.randomUUID()
    console.log(`[ATS-FREE ${requestId}] Fresh FREE request`)

    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get("resumeId")

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID required" }, { status: 400 })
    }

    console.log(`[ATS-FREE ${requestId}] Resume ID:`, resumeId, "Timestamp:", new Date().toISOString())

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

    // Check for cached analysis first (shared with full route)
    let analysis = null
    if (resume.analysisCache) {
      try {
        analysis = typeof resume.analysisCache === 'string'
          ? JSON.parse(resume.analysisCache)
          : resume.analysisCache
        if (analysis && analysis.score && analysis.keywords) {
          console.log(`[ATS-FREE ${requestId}] Using CACHED AI analysis`)
        } else {
          analysis = null
        }
      } catch (e) {
        console.log(`[ATS-FREE ${requestId}] Cache parse failed, regenerating`)
        analysis = null
      }
    }

    // If no cache, generate fresh AI analysis and cache it
    if (!analysis) {
      console.log(`[ATS-FREE ${requestId}] Generating FRESH AI analysis for:`, resume.fileName)

      let resumeText = ''
      try {
        const buffer = Buffer.from(resume.fileContent, 'base64')
        resumeText = buffer.toString('utf-8')
        resumeText = resumeText.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim()
      } catch (e) {
        console.error(`[ATS-FREE ${requestId}] Text extraction failed:`, e)
        resumeText = 'Unable to extract text from resume'
      }

      console.log(`[ATS-FREE ${requestId}] Generating AI analysis (${resumeText.length} chars)`)
      analysis = await generateATSAnalysis(resumeText)

      // Cache the result for reuse by the full route
      try {
        await sql`
          UPDATE resume_uploads
          SET "analysisCache" = ${JSON.stringify(analysis)}::jsonb
          WHERE id = ${resumeId}
        `
        console.log(`[ATS-FREE ${requestId}] Analysis cached for future use`)
      } catch (e) {
        console.error(`[ATS-FREE ${requestId}] Cache write failed:`, e)
      }
    }

    // Return LIMITED free tier results from the real AI analysis
    const freeResult = {
      score: analysis.score,
      isPremium: false,
      keywords: {
        found: (analysis.keywords?.found || []).slice(0, 3),
        missing: (analysis.keywords?.missing || []).slice(0, 5),
      },
      formatting: (analysis.formatting || []).slice(0, 2),
      tips: (analysis.tips || []).slice(0, 2),
    }

    console.log(`[ATS-FREE ${requestId}] Analysis complete. Score:`, freeResult.score)

    const response = NextResponse.json(freeResult)

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

    console.log(`[ATS-FREE ${requestId}] Response sent with score ${freeResult.score}`)

    return response
  } catch (error: any) {
    console.error("[ERROR REPORT] ATS Free Analysis Error:", error)
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
