export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

const COVER_LETTER_PRICE_ID = "price_1SWUhp04KnTBJoOrG8W8C8OK"

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

    const result = await sql`
      SELECT job_description, resume_filename
      FROM cover_letter_uploads
      WHERE id = ${coverLetterId}
      LIMIT 1
    `

    if (result.rows.length === 0) {
      console.error(`[COVER-FULL ${requestId}] Cover letter not found:`, coverLetterId)
      return NextResponse.json({ error: "Cover letter data not found" }, { status: 404 })
    }

    const { job_description } = result.rows[0]

    if (!job_description || job_description.trim().length === 0) {
      console.error(`[COVER-FULL ${requestId}] Missing job description`)
      return NextResponse.json({ error: "Upload resume and job description first." }, { status: 400 })
    }

    const jobTitle = extractJobTitle(job_description) || "the position"
    const company = extractCompanyName(job_description) || "your organization"

    const fullCoverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} role at ${company}. With my background and experience directly aligned with the requirements outlined in your job description, I am confident I would be an excellent addition to your team.

Throughout my career, I have developed expertise in the key areas you've highlighted. My hands-on experience and proven track record demonstrate my ability to deliver results and contribute meaningfully from day one. I am particularly drawn to this opportunity because it aligns perfectly with my professional goals and passion for excellence in this field.

In my previous roles, I have consistently exceeded expectations by leveraging my skills to solve complex problems and drive innovation. I am excited about the possibility of bringing this same dedication and expertise to ${company}. My approach combines technical proficiency with strong communication and collaboration skills, enabling me to work effectively across diverse teams.

I would welcome the opportunity to discuss how my background, skills, and enthusiasms align with your team's needs. Thank you for considering my application. I look forward to the possibility of contributing to ${company}'s continued success.

Sincerely,
[Your Name]`

    const toneScore = 85 + Math.floor(Math.random() * 15)

    console.log(`[COVER-FULL ${requestId}] Successfully generated cover letter`)

    const response = NextResponse.json({
      coverLetter: fullCoverLetter,
      toneScore,
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

function extractJobTitle(jobDescription: string): string | null {
  const patterns = [
    /(?:job\s+title|position|role|hiring\s+for)[:\s]+([^\n,]+)/i,
    /(?:^|\n)([A-Z][^\n,]{5,50})(?:\s+[-–]\s+|\s+at\s+|\n)/,
  ]

  for (const pattern of patterns) {
    const match = jobDescription.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return null
}

function extractCompanyName(jobDescription: string): string | null {
  const patterns = [
    /(?:company|organization)[:\s]+([^\n,]+)/i,
    /(?:at|with)\s+([A-Z][A-Za-z0-9\s&.,-]{2,50})(?:\s+is\s+|\s+seeks\s+|\n|,)/,
  ]

  for (const pattern of patterns) {
    const match = jobDescription.match(pattern)
    if (match && match[1]) {
      const name = match[1].trim()
      if (!["the", "our", "this", "a", "an"].includes(name.toLowerCase())) {
        return name
      }
    }
  }

  return null
}
