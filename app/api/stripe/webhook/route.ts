import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { sql } from "@vercel/postgres"
import { neon } from "@neondatabase/serverless"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
})

const sqlNeon = neon(process.env.DATABASE_URL!)

// Legacy price IDs (keep for backward compatibility)
const ATS_PRICE_ID = "price_1SVd4E04KnTBJoOrBcQTH6T5"
const COVER_LETTER_PRICE_ID = "price_1SWUhp04KnTBJoOrG8W8C8OK"

// New Phase 1 price IDs
const NEW_PRICE_IDS = {
  ATS_OPTIMIZER: process.env.STRIPE_PRICE_ATS_OPTIMIZER!,
  COVER_LETTER: process.env.STRIPE_PRICE_COVER_LETTER!,
  RESUME_DISTRIBUTION: process.env.STRIPE_PRICE_RESUME_DISTRIBUTION!,
  DIY_PREMIUM: process.env.STRIPE_PRICE_DIY_PREMIUM!,
  RECRUITER_BASIC: process.env.STRIPE_PRICE_RECRUITER_BASIC!,
  RECRUITER_STANDARD: process.env.STRIPE_PRICE_RECRUITER_STANDARD!,
  RECRUITER_PRO: process.env.STRIPE_PRICE_RECRUITER_PRO!,
}

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

        // ===== GUEST PURCHASE HANDLER =====
        if (session.metadata?.user_type === 'guest') {
          const email = session.metadata.email
          const purchaseType = session.metadata.purchase_type
          
          try {
            // Create guest purchase record
            const result = await sqlNeon`
              INSERT INTO guest_purchases (
                email,
                purchase_type,
                stripe_payment_id,
                stripe_customer_id,
                amount_paid,
                metadata
              ) VALUES (
                ${email},
                ${purchaseType},
                ${session.payment_intent as string},
                ${session.customer as string},
                ${session.amount_total},
                ${JSON.stringify(session.metadata)}
              )
              RETURNING access_token
            `
            
            const accessToken = result[0].access_token
            
            // Send confirmation email with magic link
            const { guestPurchaseConfirmationEmail } = await import('@/lib/email-templates/guest-purchase-confirmation')
            const { sendEmail } = await import('@/lib/send-email')
            
            const emailContent = guestPurchaseConfirmationEmail(
              email,
              purchaseType,
              accessToken
            )
            
            await sendEmail(emailContent)
            
            console.log("[WEBHOOK] Guest purchase processed for:", email, purchaseType)
          } catch (error) {
            console.error("[WEBHOOK ERROR] Guest purchase failed:", error)
          }
          break
        }

        // ===== SUBSCRIPTION HANDLER =====
        if (session.mode === 'subscription') {
          console.log("[WEBHOOK] Subscription checkout completed:", session.id)
          // Subscription will be handled by subscription.created event
          break
        }

        // ===== LEGACY HANDLERS (Keep for backward compatibility) =====
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

        // ===== NEW PHASE 1 ONE-TIME PURCHASES =====
        if (priceId === NEW_PRICE_IDS.ATS_OPTIMIZER || priceId === NEW_PRICE_IDS.COVER_LETTER) {
          try {
            await sql`
              INSERT INTO premium_access (email, "stripeCustomerId", "stripeSessionId", "paidAt", product, "priceId", "expiresAt")
              VALUES (
                ${customerEmail.toLowerCase()},
                ${session.customer as string},
                ${session.id},
                NOW(),
                ${priceId === NEW_PRICE_IDS.ATS_OPTIMIZER ? 'ATS_OPTIMIZER' : 'COVER_LETTER'},
                ${priceId},
                NULL
              )
              ON CONFLICT (email, "priceId") DO NOTHING
            `
            console.log("[WEBHOOK] Premium access granted for:", customerEmail, priceId)
          } catch (dbError) {
            console.error("[WEBHOOK ERROR] Premium access DB insert failed:", dbError)
          }
        }

        console.log("[WEBHOOK] Payment completed for session:", session.id)
        break
      }

      // ===== SUBSCRIPTION EVENT HANDLERS =====
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        
        try {
          await sqlNeon`
            INSERT INTO subscriptions (
              user_id,
              subscription_type,
              stripe_customer_id,
              stripe_subscription_id,
              stripe_price_id,
              status,
              current_period_start,
              current_period_end
            ) VALUES (
              ${subscription.metadata.user_id},
              ${subscription.metadata.subscription_type},
              ${subscription.customer as string},
              ${subscription.id},
              ${subscription.items.data[0].price.id},
              ${subscription.status},
              to_timestamp(${subscription.current_period_start}),
              to_timestamp(${subscription.current_period_end})
            )
            ON CONFLICT (stripe_subscription_id) DO UPDATE SET
              status = ${subscription.status},
              current_period_end = to_timestamp(${subscription.current_period_end}),
              updated_at = NOW()
          `
          
          // Log to subscription history
          await sqlNeon`
            INSERT INTO subscription_history (
              subscription_id,
              user_id,
              event_type,
              new_status,
              metadata
            ) VALUES (
              (SELECT id FROM subscriptions WHERE stripe_subscription_id = ${subscription.id}),
              ${subscription.metadata.user_id},
              ${event.type === 'customer.subscription.created' ? 'created' : 'updated'},
              ${subscription.status},
              ${JSON.stringify(event)}
            )
          `
          
          console.log("[WEBHOOK] Subscription", event.type, "for:", subscription.id)
        } catch (error) {
          console.error("[WEBHOOK ERROR] Subscription handler failed:", error)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        
        try {
          await sqlNeon`
            UPDATE subscriptions 
            SET status = 'canceled', 
                canceled_at = NOW(),
                updated_at = NOW()
            WHERE stripe_subscription_id = ${subscription.id}
          `
          
          // Log cancellation
          await sqlNeon`
            INSERT INTO subscription_history (
              subscription_id,
              user_id,
              event_type,
              old_status,
              new_status
            ) VALUES (
              (SELECT id FROM subscriptions WHERE stripe_subscription_id = ${subscription.id}),
              (SELECT user_id FROM subscriptions WHERE stripe_subscription_id = ${subscription.id}),
              'canceled',
              'active',
              'canceled'
            )
          `
          
          console.log("[WEBHOOK] Subscription canceled:", subscription.id)
        } catch (error) {
          console.error("[WEBHOOK ERROR] Subscription deletion failed:", error)
        }
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
