import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const email = formData.get("email") as string
    const targetRoles = formData.get("targetRoles") as string
    const targetLocations = formData.get("targetLocations") as string
    const industry = formData.get("industry") as string
    const experience = formData.get("experience") as string

    if (!file || !email) {
      return NextResponse.json({ error: "File and email required" }, { status: 400 })
    }

    // Validate file type
    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.split(".").pop()
    const validExtensions = ["pdf", "docx"]

    if (!validExtensions.includes(fileExtension || "")) {
      return NextResponse.json(
        { error: "Invalid file type. Accepted formats: PDF, DOCX" },
        { status: 400 },
      )
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Convert file to base64 for storage
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Content = buffer.toString("base64")

    const result = await sql`
      INSERT INTO resume_uploads (
        "fileName",
        "fileContent",
        "fileType",
        email,
        "analysisCache"
      )
      VALUES (
        ${file.name},
        ${base64Content},
        ${file.type},
        ${email.toLowerCase().trim()},
        NULL
      )
      RETURNING id
    `

    const resumeId = result.rows[0].id

    console.log("[Resume-Distribution-Upload] Resume uploaded - ID:", resumeId, "File:", file.name, "Email:", email)

    return NextResponse.json({
      success: true,
      resumeId,
      fileName: file.name,
      fileType: file.type,
    })
  } catch (error: any) {
    console.error("[Resume-Distribution-Upload] Error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error?.message || String(error),
      },
      { status: 500 },
    )
  }
}
