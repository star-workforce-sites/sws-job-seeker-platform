import { NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"
import { sendWelcomeEmail } from "@/lib/send-recruiter-emails"

export async function POST(req: NextRequest) {
  let body: any

  // ── Parse body ──────────────────────────────────────────────
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 }
    )
  }

  const { name, email, password } = body

  // ── Validate required fields ────────────────────────────────
  if (!name || !email || !password) {
    return NextResponse.json(
      { success: false, message: "Name, email, and password are all required" },
      { status: 400 }
    )
  }

  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json(
      { success: false, message: "Name must be at least 2 characters" },
      { status: 400 }
    )
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { success: false, message: "Please enter a valid email address" },
      { status: 400 }
    )
  }

  if (password.length < 8) {
    return NextResponse.json(
      { success: false, message: "Password must be at least 8 characters" },
      { status: 400 }
    )
  }

  const normalizedEmail = email.toLowerCase().trim()

  try {
    // ── Check for existing account ────────────────────────────
    const existing = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail}
    `
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      )
    }

    // ── Hash password ─────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10)

    // ── Insert user ───────────────────────────────────────────
    const result = await sql`
      INSERT INTO users (
        name,
        email,
        password,
        role,
        email_verified,
        updated_at
      ) VALUES (
        ${name.trim()},
        ${normalizedEmail},
        ${hashedPassword},
        'jobseeker',
        false,
        NOW()
      )
      RETURNING id, name, email, role
    `

    const newUser = result.rows[0]

    // ── Send welcome email (non-blocking) ─────────────────────
    sendWelcomeEmail({
      userName: newUser.name,
      userEmail: newUser.email,
    }).catch((err) => {
      console.error("[register] Welcome email failed (non-blocking):", err)
    })

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully!",
        userId: newUser.id,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("[register] Error:", error?.message ?? error)

    if (error?.message?.includes("duplicate key") || error?.message?.includes("unique")) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Registration failed. Please try again or contact support@starworkforcesolutions.com",
      },
      { status: 500 }
    )
  }
}
