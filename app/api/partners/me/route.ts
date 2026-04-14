import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getPartnerByUserId, getPartnerStats, getPartnerReferrals, getPartnerCommissions } from "@/lib/partners"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const partner = await getPartnerByUserId(session.user.id)
    if (!partner) {
      return NextResponse.json({ error: "Not a partner" }, { status: 403 })
    }

    const [stats, referrals, commissions] = await Promise.all([
      getPartnerStats(partner.id),
      getPartnerReferrals(partner.id),
      getPartnerCommissions(partner.id),
    ])

    return NextResponse.json({
      partner,
      stats,
      referrals,
      commissions,
    })
  } catch (error) {
    console.error("[Partner API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
