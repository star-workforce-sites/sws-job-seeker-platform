import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import { getAllPartners, createPartner, updatePartner } from "@/lib/partners"
import { sendEmail } from "@/lib/send-email"
import { emailTemplates } from "@/lib/email-templates"

// GET all partners (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const partners = await getAllPartners()

    // Get referral + commission counts for each partner
    const enriched = await Promise.all(
      partners.map(async (p) => {
        const statsResult = await sql`
          SELECT
            (SELECT COUNT(*) FROM partner_referrals WHERE partner_id = ${p.id})::int AS referral_count,
            COALESCE((SELECT SUM(commission_amount) FROM partner_commissions WHERE partner_id = ${p.id}), 0) AS total_commission,
            COALESCE((SELECT SUM(commission_amount) FROM partner_commissions WHERE partner_id = ${p.id} AND status = 'pending'), 0) AS pending_commission
        `
        return { ...p, ...statsResult.rows[0] }
      })
    )

    return NextResponse.json({ partners: enriched })
  } catch (error) {
    console.error("[Admin Partners] GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create new partner (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { name, email, phone, referralCode, tier, commissionRate, overheadPct, landingHeadline, landingBio, status } = body

    if (!name || !email || !referralCode || !tier) {
      return NextResponse.json({ error: "name, email, referralCode, and tier are required" }, { status: 400 })
    }

    if (!["affiliate", "sales"].includes(tier)) {
      return NextResponse.json({ error: "tier must be affiliate or sales" }, { status: 400 })
    }

    // Check for duplicate referral code
    const existing = await sql`SELECT id FROM partners WHERE referral_code = ${referralCode.toLowerCase()} LIMIT 1`
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Referral code already in use" }, { status: 409 })
    }

    // Link to existing user account if email matches
    const userResult = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`
    const userId = userResult.rows[0]?.id || null

    const partner = await createPartner({
      name,
      email,
      phone,
      referral_code: referralCode,
      tier,
      commission_rate: commissionRate || (tier === "sales" ? 50 : 10),
      overhead_pct: overheadPct || 0,
      landing_headline: landingHeadline,
      landing_bio: landingBio,
      status: status || "active",
    })

    // Link user_id if found
    if (partner && userId) {
      await updatePartner(partner.id, { user_id: userId })

      // Also update the user's role to 'partner'
      await sql`UPDATE users SET role = 'partner' WHERE id = ${userId}`
    }

    // ── Send welcome email to partner + admin notification (non-blocking) ──
    if (partner) {
      const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.starworkforcesolutions.com"
      const refCode = partner.referral_code
      const actualRate = partner.commission_rate

      // Welcome email to partner
      const welcomeTemplate = emailTemplates.partnerWelcome({
        partnerName: partner.name,
        partnerEmail: partner.email,
        tier: partner.tier as "affiliate" | "sales",
        referralCode: refCode,
        commissionRate: actualRate,
        landingPageUrl: `${baseUrl}/partner/${refCode}`,
        signupUrl: `${baseUrl}/auth/signup?ref=${refCode}`,
      })
      sendEmail({
        to: partner.email,
        subject: welcomeTemplate.subject,
        html: welcomeTemplate.html,
        text: `Welcome to the Career Accel Partner Program! Your referral code is ${refCode.toUpperCase()}. Landing page: ${baseUrl}/partner/${refCode}`,
      }).catch((err) => console.error("[Admin Partners] Failed to send partner welcome email:", err))

      // Admin notification
      const adminTemplate = emailTemplates.adminPartnerNotification({
        partnerName: partner.name,
        partnerEmail: partner.email,
        tier: partner.tier,
        referralCode: refCode,
        commissionRate: actualRate,
        createdAt: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
      })
      const adminRecipients = ["Srikanth@startekk.net", "info@startekk.net"]
      for (const admin of adminRecipients) {
        sendEmail({
          to: admin,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
          text: `New partner created: ${partner.name} (${partner.email}), tier: ${partner.tier}, code: ${refCode}`,
        }).catch((err) => console.error("[Admin Partners] Failed to send admin notification:", err))
      }
    }

    return NextResponse.json({ partner }, { status: 201 })
  } catch (error: any) {
    console.error("[Admin Partners] POST error:", error)
    if (error?.message?.includes("duplicate key")) {
      return NextResponse.json({ error: "Email or referral code already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH update existing partner (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Partner ID required" }, { status: 400 })
    }

    // Map camelCase to snake_case
    const mapped: Record<string, unknown> = {}
    if (updates.name !== undefined) mapped.name = updates.name
    if (updates.phone !== undefined) mapped.phone = updates.phone
    if (updates.tier !== undefined) mapped.tier = updates.tier
    if (updates.commissionRate !== undefined) mapped.commission_rate = updates.commissionRate
    if (updates.status !== undefined) mapped.status = updates.status
    if (updates.overheadPct !== undefined) mapped.overhead_pct = updates.overheadPct
    if (updates.landingHeadline !== undefined) mapped.landing_headline = updates.landingHeadline
    if (updates.landingBio !== undefined) mapped.landing_bio = updates.landingBio
    if (updates.notes !== undefined) mapped.notes = updates.notes

    const partner = await updatePartner(id, mapped as any)
    return NextResponse.json({ partner })
  } catch (error) {
    console.error("[Admin Partners] PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
