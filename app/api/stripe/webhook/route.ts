import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { sql } from "@vercel/postgres"
import { neon } from "@neondatabase/serverless"
import { sendSubscriptionConfirmationEmail, sendAdminNotificationEmail, sendPurchaseNotificationEmail, getPlanDetails } from "@/lib/send-recruiter-emails"
import { triggerResumeDistribution } from "@/lib/resumeblast"
import { getDbUrl } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
})

const sqlNeon = neon(getDbUrl())

// Price IDs
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

    console.log("[Webhook] Event received:", event.type)

    // Handle subscription events
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      // Check if this is a subscription
      if (session.mode === "subscription" && session.subscription) {
        const subscriptionId = session.subscription as string
        const customerId = session.customer as string
        const customerEmail = session.customer_details?.email

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id

        // Determine subscription type
        let subscriptionType = "unknown"
        if (priceId === NEW_PRICE_IDS.RECRUITER_BASIC) subscriptionType = "recruiter_basic"
        else if (priceId === NEW_PRICE_IDS.RECRUITER_STANDARD) subscriptionType = "recruiter_standard"
        else if (priceId === NEW_PRICE_IDS.RECRUITER_PRO) subscriptionType = "recruiter_pro"
        else if (priceId === NEW_PRICE_IDS.DIY_PREMIUM) subscriptionType = "diy_premium"

        console.log("[Webhook] Subscription type:", subscriptionType)

        // Get or create user
        let userId = null
        if (customerEmail) {
          const userResult = await sqlNeon`
            SELECT id, name, email FROM users WHERE email = ${customerEmail}
          `
          
          if (userResult.length > 0) {
            userId = userResult[0].id
          } else {
            // Create user if doesn't exist
            const newUserResult = await sqlNeon`
              INSERT INTO users (email, name, role)
              VALUES (${customerEmail}, ${session.customer_details?.name || 'New User'}, 'jobseeker')
              RETURNING id
            `
            userId = newUserResult[0].id
          }
        }

        // Create subscription record
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
            ${userId},
            ${subscriptionType},
            ${customerId},
            ${subscriptionId},
            ${priceId},
            ${subscription.status},
            to_timestamp(${subscription.current_period_start}),
            to_timestamp(${subscription.current_period_end})
          )
          ON CONFLICT (stripe_subscription_id) 
          DO UPDATE SET
            status = ${subscription.status},
            current_period_end = to_timestamp(${subscription.current_period_end})
        `

        console.log("[Webhook] Subscription record created")

        // NEW: Send email notifications (only for recruiter subscriptions)
        if (subscriptionType.startsWith('recruiter_')) {
          const planDetails = getPlanDetails(subscriptionType)
          const jobSeekerName = session.customer_details?.name || 'Valued Customer'
          const jobSeekerEmail = customerEmail || ''

          // Send confirmation email to job seeker
          await sendSubscriptionConfirmationEmail({
            jobSeekerName,
            jobSeekerEmail,
            planName: planDetails.name,
            planAmount: planDetails.amount,
            subscriptionId,
          })

          // Send notification to admin
          await sendAdminNotificationEmail({
            jobSeekerName,
            jobSeekerEmail,
            planName: planDetails.name,
            subscriptionId,
            subscribedAt: new Date().toLocaleString('en-US', { 
              timeZone: 'America/Chicago',
              dateStyle: 'full',
              timeStyle: 'short'
            }),
          })

          console.log("[Webhook] Email notifications sent")
        }
      }
    }

    // Handle one-time payment admin notifications
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === "payment") {
        const metadata = (session.metadata || {}) as Record<string, string>
        const product = metadata.product || "unknown"
        const customerEmail = session.customer_details?.email || metadata.email || ""
        const customerName = session.customer_details?.name || customerEmail
        const amountTotal = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0.00"

        const productNames: Record<string, string> = {
          "ATS_OPTIMIZER":       "ATS Resume Optimizer",
          "COVER_LETTER":        "Cover Letter Generator",
          "interview-prep":      "Interview Prep",
          "resume-distribution": "Resume Distribution",
        }
        const productName = `${productNames[product] || product} ($${amountTotal})`

        try {
          await sendPurchaseNotificationEmail({
            customerName,
            customerEmail,
            productName,
            amount: amountTotal,
            metadata,
          })
        } catch (emailErr) {
          console.error("[Webhook] Purchase notification email failed:", emailErr)
        }

        // ResumeBlast.ai integration — only fires if RESUMEBLAST_API_URL + RESUMEBLAST_API_KEY are set
        if (product === "resume-distribution") {
          try {
            await triggerResumeDistribution({
              resumeId: metadata.resumeId || "",
              email: customerEmail,
              customerName,
              targetRoles: metadata.targetRoles || "",
              targetLocations: metadata.targetLocations || "",
              industry: metadata.industry || "",
              experience: metadata.experience || "",
              stripePaymentId: session.id,
            })
          } catch (rbErr) {
            console.error("[Webhook] ResumeBlast trigger failed:", rbErr)
          }
        }

        console.log("[Webhook] One-time payment processed:", product, "for", customerEmail)
      }
    }

    // Handle subscription updates
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription

      await sqlNeon`
        UPDATE subscriptions
        SET 
          status = ${subscription.status},
          current_period_end = to_timestamp(${subscription.current_period_end}),
          cancel_at_period_end = ${subscription.cancel_at_period_end}
        WHERE stripe_subscription_id = ${subscription.id}
      `

      console.log("[Webhook] Subscription updated")
    }

    // Handle subscription deletion
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription

      await sqlNeon`
        UPDATE subscriptions
        SET 
          status = 'canceled',
          canceled_at = NOW()
        WHERE stripe_subscription_id = ${subscription.id}
      `

      console.log("[Webhook] Subscription canceled")
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("[Webhook] Error:", error)
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    )
  }
}
