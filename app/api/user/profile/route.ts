import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { sql } from "@vercel/postgres"

// GET /api/user/profile
// Returns current user's profile

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`
      SELECT id, name, email, role, "atsPremium", "createdAt"
      FROM users
      WHERE id = ${user.id}
      LIMIT 1
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: result.rows[0] })
  } catch (error) {
    console.error("[v0] Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

// PATCH /api/user/profile
// Updates current user's profile

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE users
      SET name = ${name}
      WHERE id = ${user.id}
      RETURNING id, name, email, role, "atsPremium", "createdAt"
    `

    return NextResponse.json({ user: result.rows[0] })
  } catch (error) {
    console.error("[v0] Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
