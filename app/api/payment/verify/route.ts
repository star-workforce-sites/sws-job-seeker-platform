import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover" as Stripe.LatestApiVersion,
})

/**
 * GET /api/payment/verify?session_id=xxx
 *
 * Verifies a Stripe checkout session is real and paid.
 * Used by the payment success page to confirm premium access.
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = new URL(request.url).searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ verified: false, error: "Missing session_id" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === "paid") {
      return NextResponse.json({ verified: true })
    }

    return NextResponse.json({ verified: false, error: "Payment not completed" })
  } catch (error) {
    console.error("[Payment Verify] Error:", error)
    return NextResponse.json({ verified: false, error: "Verification failed" }, { status: 500 })
  }
}
