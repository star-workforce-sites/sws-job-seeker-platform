import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

/**
 * POST /api/subscription/cancel
 *
 * Cancels the user's active recruiter subscription:
 * 1. Sets Stripe subscription to cancel_at_period_end = true (stays active until expiry)
 * 2. Immediately unassigns the recruiter in recruiter_assignments
 * 3. Sends admin notification email to info@starworkforcesolutions.com
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get the active subscription (cast to uuid to match column type)
    const subResult = await sql`
      SELECT id, stripe_subscription_id, subscription_type, current_period_end
      FROM subscriptions
      WHERE user_id = ${userId}::uuid
        AND status = 'active'
        AND subscription_type LIKE 'recruiter_%'
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (subResult.rows.length === 0) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      )
    }

    const sub = subResult.rows[0]
    const stripeSubId = sub.stripe_subscription_id as string | null

    // 1. Cancel at period end in Stripe (if Stripe sub ID exists)
    if (stripeSubId) {
      try {
        await stripe.subscriptions.update(stripeSubId, {
          cancel_at_period_end: true,
        })
        console.log("[Cancel] Stripe subscription set to cancel at period end:", stripeSubId)
      } catch (stripeErr) {
        console.error("[Cancel] Stripe update failed:", stripeErr)
        // Don't block the rest of the flow if Stripe call fails
      }
    }

    // 2. Immediately unassign recruiter in recruiter_assignments
    // Note: recruiter_assignments has no updated_at column — only status, paused_at, completed_at
    const unassignResult = await sql`
      UPDATE recruiter_assignments
      SET status = 'inactive', completed_at = NOW()
      WHERE client_id = ${userId}::uuid
        AND status = 'active'
      RETURNING id, recruiter_id
    `

    const unassigned = unassignResult.rows
    console.log("[Cancel] Unassigned recruiter rows:", unassigned.length)

    // 3. Mark subscription as cancel_at_period_end in our DB
    await sql`
      UPDATE subscriptions
      SET cancel_at_period_end = true, updated_at = NOW()
      WHERE id = ${sub.id}
    `

    // 4. Send admin notification email
    const planLabel = sub.subscription_type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase())

    const periodEnd = sub.current_period_end
      ? new Date(sub.current_period_end).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "end of billing period"

    try {
      const resendKey = process.env.RESEND_API_KEY
      if (resendKey) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Career Accel Platform <noreply@starworkforcesolutions.com>",
            to: ["Srikanth@startekk.net", "info@startekk.net"],
            subject: `[Cancellation] ${session.user.name || session.user.email} cancelled their ${planLabel}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #0A1A2F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="margin: 0; color: #E8C547;">⚠️ Subscription Cancellation</h2>
                </div>
                <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                  <p>A job seeker has cancelled their recruiter plan. The recruiter has been unassigned immediately.</p>

                  <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                    <tr><td style="padding: 8px 0; color: #666; width: 140px;">Name:</td><td style="padding: 8px 0; font-weight: bold;">${session.user.name || "Not provided"}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${session.user.email}">${session.user.email}</a></td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Plan:</td><td style="padding: 8px 0;">${planLabel}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Access until:</td><td style="padding: 8px 0; color: #d97706; font-weight: bold;">${periodEnd}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Recruiters unassigned:</td><td style="padding: 8px 0;">${unassigned.length}</td></tr>
                  </table>

                  <div style="margin-top: 20px; padding: 12px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; font-size: 13px; color: #92400e;">
                      <strong>Action needed:</strong> The job seeker's plan stays active until <strong>${periodEnd}</strong>.
                      Please follow up if this was a mistake or if they need support.
                    </p>
                  </div>

                  <div style="margin-top: 20px; text-align: center;">
                    <a href="https://www.starworkforcesolutions.com/dashboard/admin"
                       style="display: inline-block; background: #0A1A2F; color: #E8C547; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                      View Admin Dashboard
                    </a>
                  </div>
                </div>
              </div>
            `,
          }),
        })
      }
    } catch (emailErr) {
      console.error("[Cancel] Admin email failed:", emailErr)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Subscription will be cancelled at the end of your billing period. Your recruiter has been unassigned.",
      activeUntil: sub.current_period_end,
    })
  } catch (error) {
    console.error("[Cancel Subscription] Error:", error)
    return NextResponse.json(
      { error: "Failed to cancel subscription", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
