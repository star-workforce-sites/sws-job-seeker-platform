import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { sql } from "@vercel/postgres"
import { authOptions } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { jobId, notes } = await request.json()

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      )
    }

    // Get user ID from database using email
    const userResult = await sql`
      SELECT id, "atsPremium" FROM users 
      WHERE LOWER(email) = LOWER(${session.user.email})
      LIMIT 1
    `

    if (userResult.rowCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const userId = userResult.rows[0].id
    const isPremium = userResult.rows[0].atsPremium || false

    // Check daily limit for free users
    if (!isPremium) {
      const today = new Date().toISOString().split("T")[0]
      const limitCheck = await sql`
        SELECT count FROM application_limits
        WHERE "userId" = ${userId} AND date = ${today}
      `

      const currentCount = limitCheck.rows[0]?.count || 0

      if (currentCount >= 5) {
        return NextResponse.json(
          {
            error: "Daily application limit reached",
            message: "Free users can apply to 5 jobs per day. Upgrade to premium for unlimited applications.",
          },
          { status: 429 }
        )
      }
    }

    // Check if already applied
    const existingApp = await sql`
      SELECT id FROM applications 
      WHERE "userId" = ${userId} AND "jobId" = ${jobId}
    `

    if (existingApp.rowCount > 0) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 409 }
      )
    }

    // Create application
    const result = await sql`
      INSERT INTO applications ("userId", "jobId", notes, status, "appliedAt", "updatedAt")
      VALUES (${userId}, ${jobId}, ${notes || null}, 'applied', NOW(), NOW())
      RETURNING id, "jobId", status, "appliedAt"
    `

    // Update daily limit counter
    if (!isPremium) {
      const today = new Date().toISOString().split("T")[0]
      await sql`
        INSERT INTO application_limits ("userId", date, count)
        VALUES (${userId}, ${today}, 1)
        ON CONFLICT ("userId", date)
        DO UPDATE SET count = application_limits.count + 1
      `
    }

    return NextResponse.json(
      {
        success: true,
        application: result.rows[0],
        message: "Application submitted successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[Apply API] Error:", error)
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ applied: false }, { status: 200 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      )
    }

    // Get user ID from database
    const userResult = await sql`
      SELECT id FROM users 
      WHERE LOWER(email) = LOWER(${session.user.email})
      LIMIT 1
    `

    if (userResult.rowCount === 0) {
      return NextResponse.json({ applied: false }, { status: 200 })
    }

    const userId = userResult.rows[0].id

    // Check if applied
    const result = await sql`
      SELECT id, "appliedAt", status 
      FROM applications 
      WHERE "userId" = ${userId} AND "jobId" = ${jobId}
      LIMIT 1
    `

    return NextResponse.json(
      {
        applied: result.rowCount > 0,
        application: result.rowCount > 0 ? result.rows[0] : null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Apply Check] Error:", error)
    return NextResponse.json({ applied: false }, { status: 200 })
  }
}
