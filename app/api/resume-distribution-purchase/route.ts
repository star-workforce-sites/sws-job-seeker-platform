import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { sql } from "@vercel/postgres"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const { email, resumeId, targetRoles, targetLocations, industry, experience } = await request.json()
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.starworkforcesolutions.com"

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    // Check existing purchase
    const existing = await sql`
      SELECT id FROM premium_access
      WHERE LOWER(email) = LOWER(${email})
      AND product = 'resume-distribution'
      LIMIT 1
    `
    if (existing.rows.length > 0) {
      return NextResponse.json({ alreadyPurchased: true })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_RESUME_DISTRIBUTION!,
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email,
      success_url: `${baseUrl}/api/resume-distribution-success?email=${encodeURIComponent(email)}&status=success`,
      cancel_url: `${baseUrl}/tools/resume-distribution?status=cancelled`,
      metadata: {
        product: "resume-distribution",
        email,
        resumeId: resumeId || "",
        targetRoles: targetRoles || "",
        targetLocations: targetLocations || "",
        industry: industry || "",
        experience: experience || "",
      },
    })

    if (!session.url) {
      throw new Error("Failed to create checkout session")
    }

    console.log("[Resume-Distribution-Purchase] Checkout session created for:", email)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("[Resume-Distribution-Purchase] Error:", error)
    return NextResponse.json(
      {
        error: "Purchase failed",
        details: error?.message || String(error),
      },
      { status: 500 },
    )
  }
}
