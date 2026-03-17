import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const status = searchParams.get("status")

    if (status === "success" && email) {
      console.log("[INTERVIEW-PREP-SUCCESS] Processing success for:", email)

      // Check if already exists
      const existing = await sql`
        SELECT id FROM premium_access
        WHERE LOWER(email) = LOWER(${email})
        AND product = 'interview-prep'
        LIMIT 1
      `

      if (existing.rows.length === 0) {
        // Determine which price was used (check bundle eligibility)
        const bundleCheck = await sql`
          SELECT id FROM premium_access
          WHERE LOWER(email) = LOWER(${email})
          AND product IN ('ATS_OPTIMIZER', 'COVER_LETTER')
          LIMIT 1
        `

        const isBundleEligible = bundleCheck.rows.length > 0
        const priceId = isBundleEligible
          ? process.env.STRIPE_PRICE_INTERVIEW_PREP_BUNDLE!
          : process.env.STRIPE_PRICE_INTERVIEW_PREP!

        // Insert premium access record
        await sql`
          INSERT INTO premium_access (email, product, "priceId", "paidAt")
          VALUES (${email}, 'interview-prep', ${priceId}, NOW())
          ON CONFLICT (email, product) DO NOTHING
        `

        console.log("[INTERVIEW-PREP-SUCCESS] Premium access granted for:", email)
      } else {
        console.log("[INTERVIEW-PREP-SUCCESS] Premium access already exists for:", email)
      }

      // Set premium cookie
      const cookieStore = await cookies()
      cookieStore.set("interviewPrepPremium", "true", {
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        httpOnly: true,
      })

      cookieStore.set("interviewPrepEmail", email, {
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        httpOnly: false,
      })
    }

    // Redirect back to interview prep page
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.starworkforcesolutions.com"
    return NextResponse.redirect(
      `${baseUrl}/tools/interview-prep?status=${status || "error"}&email=${encodeURIComponent(email || "")}`,
    )
  } catch (error: any) {
    console.error("[INTERVIEW-PREP-SUCCESS] Error:", error)
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.starworkforcesolutions.com"
    return NextResponse.redirect(`${baseUrl}/tools/interview-prep?status=error`)
  }
}
