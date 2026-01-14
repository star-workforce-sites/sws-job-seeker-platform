import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { requireAuth } from "@/lib/session"
import { createResume } from "@/lib/db"

// POST /api/upload/resume
// Uploads resume to Vercel Blob and saves record to database

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only PDF and DOCX files are allowed." }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 })
    }

    // Upload to Vercel Blob
    const filename = `resumes/${user.id}/${Date.now()}-${file.name}`
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    })

    // Save record to database
    const resume = await createResume({
      userId: user.id,
      fileUrl: blob.url,
    })

    if (!resume) {
      return NextResponse.json({ error: "Failed to save resume record" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      resumeId: resume.id,
    })
  } catch (error: any) {
    console.error("[v0] Error uploading resume:", error)

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ error: "Failed to upload resume" }, { status: 500 })
  }
}
