import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { sql } from "@vercel/postgres"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
})

export async function POST(request: NextRequest) {
  try {
    const { email, sessionId } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.starworkforcesolutions.com"

    // Check existing purchase
    const existingPurchase = await sql`
      SELECT id FROM premium_access
      WHERE LOWER(email) = LOWER(${email})
      AND product = 'interview-prep'
      LIMIT 1
    `

    if (existingPurchase.rows.length > 0) {
      console.log("[INTERVIEW-PREP-PURCHASE] User already has interview-prep premium:", email)
      return NextResponse.json({ alreadyPurchased: true })
    }

    // Check bundle eligibility (user has ATS or Cover Letter)
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

    console.log("[INTERVIEW-PREP-PURCHASE] Bundle eligible:", isBundleEligible, "Price ID:", priceId)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      customer_email: email || undefined,
      success_url: `${baseUrl}/api/interview-prep-success?email=${encodeURIComponent(email || "")}&status=success`,
      cancel_url: `${baseUrl}/tools/interview-prep?status=cancelled&email=${encodeURIComponent(email || "")}`,
      metadata: {
        product: "interview-prep",
        email: email || "",
        sessionId: sessionId || "",
        bundlePrice: isBundleEligible ? "true" : "false",
      },
    })

    if (!session.url) {
      throw new Error("Failed to create checkout session")
    }

    console.log("[INTERVIEW-PREP-PURCHASE] Checkout session created:", session.id)

    return NextResponse.json({
      checkoutUrl: session.url,
      bundleApplied: isBundleEligible,
      price: isBundleEligible ? "$5" : "$9",
    })
  } catch (error: any) {
    console.error("[INTERVIEW-PREP-PURCHASE] Error:", error)
    return NextResponse.json(
      {
        error: "Purchase failed",
        details: error?.message || String(error),
      },
      { status: 500 },
    )
  }
}
