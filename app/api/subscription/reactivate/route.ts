import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia" as any,
})

/**
 * POST /api/subscription/reactivate
 *
 * Reactivates a subscription that was cancelled with cancel_at_period_end=true.
 * Sets cancel_at_period_end=false in Stripe + DB.
 * Sends admin email to manually re-assign a recruiter.
 */
export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // 1. Find the subscription pending cancellation
    const subResult = await sql`
      SELECT id, stripe_subscription_id, subscription_type, current_period_end
      FROM subscriptions
      WHERE user_id = ${userId}::uuid
        AND status = 'active'
        AND cancel_at_period_end = true
        AND subscription_type LIKE 'recruiter_%'
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (subResult.rows.length === 0) {
      return NextResponse.json(
        { error: "No pending cancellation found for your account." },
        { status: 404 }
      )
    }

    const sub = subResult.rows[0]

    // 2. Tell Stripe to NOT cancel at period end
    if (sub.stripe_subscription_id) {
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: false,
      })
    }

    // 3. Update DB
    await sql`
      UPDATE subscriptions
      SET cancel_at_period_end = false, updated_at = NOW()
      WHERE id = ${sub.id}
    `

    // 4. Notify admin to re-assign recruiter
    const resendKey = process.env.RESEND_API_KEY
    const planLabels: Record<string, string> = {
      recruiter_basic:    "Basic ($199/mo)",
      recruiter_standard: "Standard ($399/mo)",
      recruiter_pro:      "Pro ($599/mo)",
    }
    const planLabel = planLabels[sub.subscription_type] ?? sub.subscription_type
    const userName = session.user.name || session.user.email

    if (resendKey) {
      const expiryDate = sub.current_period_end
        ? new Date(sub.current_period_end).toLocaleDateString("en-US", { timeZone: "America/Chicago", dateStyle: "full" })
        : "end of billing period"

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Career Accel Platform <noreply@starworkforcesolutions.com>",
          to: ["Srikanth@startekk.net", "info@startekk.net"],
          subject: `[Reactivation] ${userName} reactivated their ${planLabel}`,
          html: `
            <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f4f4f4;">
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#0A1A2F;color:white;padding:20px;border-radius:8px 8px 0 0;">
                <h2 style="margin:0;color:#E8C547;">🔄 Subscription Reactivated</h2>
              </div>
              <div style="padding:20px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
                <p>A job seeker has reactivated their subscription after previously cancelling.</p>
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:6px 0;color:#666;width:160px;">Customer:</td><td style="padding:6px 0;font-weight:bold;">${userName}</td></tr>
                  <tr><td style="padding:6px 0;color:#666;">Email:</td><td style="padding:6px 0;">${session.user.email}</td></tr>
                  <tr><td style="padding:6px 0;color:#666;">Plan:</td><td style="padding:6px 0;font-weight:bold;color:#059669;">${planLabel}</td></tr>
                  <tr><td style="padding:6px 0;color:#666;">Billing ends:</td><td style="padding:6px 0;">${expiryDate}</td></tr>
                </table>
                <div style="margin-top:16px;padding:12px;background:#fef3c7;border-radius:6px;border-left:4px solid #f59e0b;">
                  <p style="margin:0;font-size:13px;color:#92400e;">
                    <strong>Action needed:</strong> Please reassign a recruiter to ${session.user.email} in the Admin Dashboard.
                  </p>
                </div>
                <div style="margin-top:16px;text-align:center;">
                  <a href="https://www.starworkforcesolutions.com/dashboard/admin" style="display:inline-block;background:#0A1A2F;color:#E8C547;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
                    Open Admin Dashboard
                  </a>
                </div>
              </div>
            </div>
            </body></html>
          `,
        }),
      })
    }

    console.log("[Reactivate] Subscription reactivated for:", session.user.email)

    return NextResponse.json({
      success: true,
      message: "Subscription reactivated. A recruiter will be reassigned within 48 hours.",
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[Reactivate] Error:", msg)
    return NextResponse.json({ error: "Failed to reactivate subscription.", details: msg }, { status: 500 })
  }
}
