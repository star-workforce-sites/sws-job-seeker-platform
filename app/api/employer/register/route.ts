import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyName, email, phone, industry, companySize, visaSponsor, visaTypes } = body

    if (!email || !companyName) {
      return NextResponse.json({ error: "Email and company name are required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

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
