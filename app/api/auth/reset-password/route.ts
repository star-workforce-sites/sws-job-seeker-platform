import { NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Token and new password are required" },
        { status: 400 }
      )
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Find user with valid, non-expired reset token
    const userResult = await sql`
      SELECT id, email FROM users
      WHERE "resetToken" = ${token}
        AND "resetTokenExpiry" > NOW()
      LIMIT 1
    `

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset token. Please request a new password reset." },
        { status: 400 }
      )
    }

    const user = userResult.rows[0]

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password and clear reset token
    await sql`
      UPDATE users
      SET password = ${hashedPassword},
          "resetToken" = NULL,
          "resetTokenExpiry" = NULL
      WHERE id = ${user.id}
    `

    console.log("[Reset Password] Password updated for:", user.email)

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. Please sign in with your new password.",
    })
  } catch (error) {
    console.error("[Reset Password] Error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}
