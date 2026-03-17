import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const status = searchParams.get("status")
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.starworkforcesolutions.com"

    if (status === "success" && email) {
      // Record the purchase in the database
      await sql`
        INSERT INTO premium_access (id, email, product, "priceId", "paidAt")
        VALUES (gen_random_uuid(), ${email}, 'resume-distribution', ${process.env.STRIPE_PRICE_RESUME_DISTRIBUTION!}, NOW())
        ON CONFLICT (email, product) DO NOTHING
      `

      console.log(`[Resume-Distribution-Success] Premium access granted for ${email}`)

      // TODO: Send admin notification email for manual fulfillment
      // TODO: Future - trigger ResumeBlast.ai API or similar service
    }

    return NextResponse.redirect(
      `${baseUrl}/tools/resume-distribution?status=${status}&email=${encodeURIComponent(email || "")}`,
    )
  } catch (error: any) {
    console.error("[Resume-Distribution-Success] Error:", error)
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.starworkforcesolutions.com"
    return NextResponse.redirect(`${baseUrl}/tools/resume-distribution?status=error`)
  }
}
