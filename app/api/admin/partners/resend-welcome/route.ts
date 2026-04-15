import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import { sendEmail } from "@/lib/send-email"
import { emailTemplates } from "@/lib/email-templates"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { partnerId } = await req.json()
    if (!partnerId) {
      return NextResponse.json({ error: "partnerId required" }, { status: 400 })
    }

    const result = await sql`SELECT * FROM partners WHERE id = ${partnerId} LIMIT 1`
    const partner = result.rows[0]
    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.starworkforcesolutions.com"
    const refCode = partner.referral_code as string

    const template = emailTemplates.partnerWelcome({
      partnerName: partner.name as string,
      partnerEmail: partner.email as string,
      tier: partner.tier as "affiliate" | "sales",
      referralCode: refCode,
      commissionRate: Number(partner.commission_rate),
      landingPageUrl: `${baseUrl}/partner/${refCode}`,
      signupUrl: `${baseUrl}/auth/signup?ref=${refCode}`,
    })

    const emailResult = await sendEmail({
      to: partner.email as string,
      subject: template.subject,
      html: template.html,
      text: `Welcome to the Career Accel Partner Program! Your referral code is ${refCode.toUpperCase()}. Landing page: ${baseUrl}/partner/${refCode}`,
    })

    if (!emailResult.success) {
      console.error("[Resend Welcome] Email failed:", emailResult.error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, sentTo: partner.email })
  } catch (error) {
    console.error("[Resend Welcome] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
