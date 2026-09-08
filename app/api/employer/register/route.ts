import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // SECURITY (fixed Sept 8, 2026 — see claude/knowledge-base.md §0l):
    // this route used to upsert any submitted email straight into the
    // users table with role='employer', with no session check at all.
    // That meant anyone submitting this public form with an existing
    // user's email silently converted that account to 'employer' and
    // overwrote its name. Live-reproduced and confirmed exploitable.
    // Fix: require a signed-in session, and require the submitted email
    // to match the signed-in user's own email — so this route can only
    // ever act on the current user's own account, never someone else's.
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be signed in to register as an employer." },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { companyName, email, phone, industry, companySize, visaSponsor, visaTypes } = body

    if (!email || !companyName) {
      return NextResponse.json({ error: "Email and company name are required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const sessionEmail = session.user.email.toLowerCase().trim()

    if (normalizedEmail !== sessionEmail) {
      return NextResponse.json(
        { error: "The email on this form must match the email you're signed in with." },
        { status: 403 },
      )
    }

    const result = await sql`
      INSERT INTO users (email, name, role, "createdAt")
      VALUES (${normalizedEmail}, ${companyName}, 'employer', NOW())
      ON CONFLICT (email) DO UPDATE SET role = 'employer', name = ${companyName}
      RETURNING id, email, name, role
    `

    console.log("[v0] Employer registered:", result.rows[0])

    return NextResponse.json({
      success: true,
      message: "Employer registration successful!",
      employer: result.rows[0],
    })
  } catch (error: any) {
    console.error("[ERROR] Employer registration failed:", error)
    return NextResponse.json({ error: "Registration failed", details: error?.message }, { status: 500 })
  }
}
