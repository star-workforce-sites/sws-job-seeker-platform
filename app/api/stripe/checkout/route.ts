import { type NextRequest, NextResponse } from "next/server"
import { createCheckoutSession, STRIPE_PRODUCTS } from "@/lib/stripe"
import { getCurrentUser } from "@/lib/session"

// POST /api/stripe/checkout
// Creates a Stripe checkout session for ATS Optimizer or subscription

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { product } = body

    // Validate product
    if (!product || !(product in STRIPE_PRODUCTS)) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"

    // Create checkout session
    const session = await createCheckoutSession({
      userId: user.id,
      productKey: product as keyof typeof STRIPE_PRODUCTS,
      successUrl: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/payment/cancel`,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("[v0] Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
