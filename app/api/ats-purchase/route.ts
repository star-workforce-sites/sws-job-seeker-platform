import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const { resumeId, email } = await request.json()

    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.starworkforcesolutions.com"

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1SVd4E04KnTBJoOrBcQTH6T5",
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email || undefined,
      success_url: `${baseUrl}/tools/ats-optimizer?resumeId=${resumeId || ""}&status=success`,
      cancel_url: `${baseUrl}/tools/ats-optimizer?resumeId=${resumeId || ""}&status=cancelled`,
      metadata: {
        product: "ATS_OPTIMIZER",
        resumeId: resumeId || "",
        email: email || "",
      },
    })

    if (!session.url) {
      throw new Error("Failed to create checkout session")
    }

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (error: any) {
    console.error("[ERROR REPORT] ATS Purchase Error:", error)
    return NextResponse.json(
      {
        error: "Purchase failed",
        details: error?.message || String(error),
        code: error?.code,
      },
      { status: 500 },
    )
  }
}
