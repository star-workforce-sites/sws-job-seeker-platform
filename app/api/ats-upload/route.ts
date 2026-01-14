import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("resume") as File
    const email = formData.get("email") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type - accept all common resume formats
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword", // .doc
      "application/rtf", // .rtf
      "text/plain", // .txt
      "application/vnd.ms-word.document.macroEnabled.12", // .docm
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template", // .dotx
    ]

    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.split(".").pop()
    const validExtensions = ["pdf", "docx", "doc", "rtf", "txt", "docm", "dotx"]

    if (!validExtensions.includes(fileExtension || "")) {
      return NextResponse.json(
        { error: "Invalid file type. Accepted formats: PDF, DOCX, DOC, RTF, TXT, DOCM, DOTX" },
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

    // Store in database without analysisCache to ensure fresh parsing on each upload
    const result = await sql`
      INSERT INTO resume_uploads ("fileName", "fileContent", "fileType", email, "analysisCache")
      VALUES (${file.name}, ${base64Content}, ${file.type}, ${email ? email.toLowerCase().trim() : null}, NULL)
      RETURNING id
    `

    const resumeId = result.rows[0].id

    console.log("[v0] New resume uploaded - ID:", resumeId, "File:", file.name)

    return NextResponse.json({
      resumeId,
      fileName: file.name,
      fileType: file.type,
    })
  } catch (error: any) {
    console.error("[ERROR REPORT] Resume Upload Error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error?.message || String(error),
        code: error?.code,
      },
      { status: 500 },
    )
  }
}
