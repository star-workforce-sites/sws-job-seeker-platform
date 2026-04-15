import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
})

export async function POST(request: NextRequest) {
  try {
    const { coverLetterId, email } = await request.json()

    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.starworkforcesolutions.com"

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_COVER_LETTER!,
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email || undefined,
      success_url: `${baseUrl}/tools/cover-letter?coverLetterId=${coverLetterId || ""}&status=success&email=${email || ""}`,
      cancel_url: `${baseUrl}/tools/cover-letter?coverLetterId=${coverLetterId || ""}&status=cancelled`,
      metadata: {
        product: "COVER_LETTER",
        productId: "prod_TTRb353ax4RD57", // Product ID from user
        coverLetterId: coverLetterId || "",
        email: email || "",
      },
    })

    if (!session.url) {
      throw new Error("Failed to create checkout session")
    }

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (error: any) {
    console.error("[ERROR] Cover Letter Purchase Error:", error)
    return NextResponse.json(
      {
        error: "Purchase failed",
        details: error?.message || String(error),
      },
      { status: 500 },
    )
  }
}
