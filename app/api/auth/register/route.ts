import { NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"

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

  // ── Validate email format ───────────────────────────────────
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { success: false, message: "Please enter a valid email address" },
      { status: 400 }
    )
  }

  // ── Validate password strength ──────────────────────────────
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
    // role default: 'jobseeker' (matches live DB schema)
    // password column: added in Step 1 (nullable text)
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

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully! You can now sign in.",
        userId: newUser.id,
      },
      { status: 201 }
    )
  } catch (error: any) {
    // Log full error server-side
    console.error("[register] Error:", error?.message ?? error)

    // Return descriptive message to client
    // Never expose raw DB errors — map to user-friendly messages
    if (error?.message?.includes("duplicate key") || error?.message?.includes("unique")) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      )
    }

    if (error?.message?.includes("password")) {
      return NextResponse.json(
        { success: false, message: "Unable to process password. Please try again." },
        { status: 500 }
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
