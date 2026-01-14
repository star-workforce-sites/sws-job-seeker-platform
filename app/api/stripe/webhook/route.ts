import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { sql } from "@vercel/postgres"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
})

const ATS_PRICE_ID = "price_1SVd4E04KnTBJoOrBcQTH6T5"
const COVER_LETTER_PRICE_ID = "price_1SWUhp04KnTBJoOrG8W8C8OK"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log("[WEBHOOK] Event type:", event.type)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        const customerEmail = session.customer_email || session.metadata?.email
        const resumeId = session.metadata?.resumeId
        const coverLetterId = session.metadata?.coverLetterId

        if (!customerEmail) {
          console.error("[WEBHOOK] No customer email in session")
          break
        }

        const sessionWithItems = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ["line_items"],
        })

        const lineItems = sessionWithItems.line_items?.data || []
        const priceId = lineItems[0]?.price?.id

        console.log("[WEBHOOK] Processing payment for priceId:", priceId)

        if (priceId === COVER_LETTER_PRICE_ID) {
          try {
            await sql`
              INSERT INTO premium_access (email, "stripeCustomerId", "stripeSessionId", "paidAt", product, "priceId", "expiresAt")
              VALUES (
                ${customerEmail.toLowerCase()},
                ${session.customer as string},
                ${session.id},
                NOW(),
                'COVER_LETTER',
                ${COVER_LETTER_PRICE_ID},
                NULL
              )
              ON CONFLICT (email, "priceId") DO NOTHING
            `

            console.log("[WEBHOOK] Cover Letter premium access granted for:", customerEmail)
          } catch (dbError) {
            console.error("[WEBHOOK ERROR] Cover Letter DB insert failed:", dbError)
          }
        }

        if (priceId === ATS_PRICE_ID) {
          try {
            await sql`
              INSERT INTO premium_access (email, "stripeCustomerId", "stripeSessionId", "paidAt", product, "priceId", "resumeId", "expiresAt")
              VALUES (
                ${customerEmail.toLowerCase()},
                ${session.customer as string},
                ${session.id},
                NOW(),
                'ATS_OPTIMIZER',
                ${ATS_PRICE_ID},
                ${resumeId || null},
                NULL
              )
              ON CONFLICT (email, "priceId") DO NOTHING
            `

            console.log("[WEBHOOK] ATS Optimizer premium access granted for:", customerEmail)
          } catch (dbError) {
            console.error("[WEBHOOK ERROR] ATS Optimizer DB insert failed:", dbError)
          }
        }

        // Subscription payments (Pro $29/mo, etc.) will go into users.subTier, NOT premium_access
        // Example: if (priceId === 'price_PRO_MONTHLY') { UPDATE users SET subTier='pro' }

        console.log("[WEBHOOK] Payment completed for session:", session.id)
        break
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log("[WEBHOOK] Payment succeeded:", paymentIntent.id)
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error("[WEBHOOK] Payment failed:", paymentIntent.id)
        break
      }

      default:
        console.log("[WEBHOOK] Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[WEBHOOK ERROR]", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 })
  }
}
