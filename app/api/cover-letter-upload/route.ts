import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const resumeFile = formData.get("resume") as File
    const jobDescription = formData.get("jobDescription") as string
    const email = formData.get("email") as string

    if (!resumeFile || !jobDescription) {
      return NextResponse.json({ error: "Resume and job description required" }, { status: 400 })
    }

    // Upload resume to Vercel Blob
    const blob = await put(`cover-letters/${Date.now()}-${resumeFile.name}`, resumeFile, {
      access: "public",
    })

    // Store in database
    const result = await sql`
      INSERT INTO cover_letter_uploads (
        email,
        resume_url,
        resume_filename,
        job_description,
        uploaded_at
      )
      VALUES (
        ${email || null},
        ${blob.url},
        ${resumeFile.name},
        ${jobDescription},
        NOW()
      )
      RETURNING id
    `

    return NextResponse.json({
      coverLetterId: result.rows[0].id,
      success: true,
    })
  } catch (error: any) {
    console.error("[ERROR] Cover Letter Upload Error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error?.message || String(error),
      },
      { status: 500 },
    )
  }
}
