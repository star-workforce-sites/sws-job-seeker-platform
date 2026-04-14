import { NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import crypto from "crypto"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find user by email
    const userResult = await sql`
      SELECT id, name, email FROM users
      WHERE LOWER(email) = ${normalizedEmail}
      LIMIT 1
    `

    // Always return success for security (don't reveal if email exists)
    if (userResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: "If your email is registered, you will receive a password reset link.",
      })
    }

    const user = userResult.rows[0]

    // Generate reset token (64 hex chars = 32 bytes)
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save token to database
    await sql`
      UPDATE users
      SET "resetToken" = ${resetToken},
          "resetTokenExpiry" = ${resetTokenExpiry.toISOString()}
      WHERE id = ${user.id}
    `

    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL || "https://www.starworkforcesolutions.com"
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`

    // Send password reset email via Resend
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0A1A2F;color:white;padding:20px;border-radius:8px 8px 0 0;">
          <h2 style="margin:0;color:#E8C547;">Password Reset Request</h2>
        </div>
        <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <p style="margin:0 0 16px;color:#374151;">
            Hi ${user.name || "there"},
          </p>
          <p style="margin:0 0 16px;color:#374151;">
            We received a request to reset your password for your STAR Workforce Solutions account.
            Click the button below to set a new password:
          </p>
          <div style="margin:24px 0;text-align:center;">
            <a href="${resetUrl}" style="display:inline-block;background:#E8C547;color:#0A1A2F;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
              Reset My Password
            </a>
          </div>
          <p style="margin:0 0 8px;color:#6B7280;font-size:13px;">
            This link will expire in <strong>1 hour</strong>.
          </p>
          <p style="margin:0 0 8px;color:#6B7280;font-size:13px;">
            If you didn't request a password reset, you can safely ignore this email.
            Your password will not be changed.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
          <p style="margin:0;color:#9CA3AF;font-size:12px;">
            If the button doesn't work, copy and paste this link into your browser:<br />
            <a href="${resetUrl}" style="color:#0A1A2F;word-break:break-all;">${resetUrl}</a>
          </p>
        </div>
      </div>
    `

    const emailResult = await resend.emails.send({
      from: "STAR Workforce <noreply@starworkforcesolutions.com>",
      to: user.email,
      subject: "Reset Your Password — STAR Workforce Solutions",
      html,
    })

    if (emailResult.error) {
      console.error("[Forgot Password] Email send failed:", emailResult.error)
      return NextResponse.json(
        { success: false, message: "Unable to send reset email. Please try again later." },
        { status: 500 }
      )
    }

    console.log("[Forgot Password] Reset email sent to:", user.email)

    return NextResponse.json({
      success: true,
      message: "If your email is registered, you will receive a password reset link.",
    })
  } catch (error) {
    console.error("[Forgot Password] Error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}
