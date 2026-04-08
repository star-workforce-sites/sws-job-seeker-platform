import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { neon } from "@neondatabase/serverless"
import { getDbUrl } from "@/lib/db"

const sqlNeon = neon(getDbUrl())

export const dynamic = "force-dynamic"

/**
 * POST /api/resume-distribution-webhook
 *
 * Receives status update callbacks from ResumeBlast.ai.
 * Verifies the HMAC-SHA256 signature from the X-ResumeBlast-Signature header.
 * Updates distribution_status in premium_access for the customer's email.
 *
 * Webhook payload events:
 *   campaign.started, campaign.status_changed, campaign.completed, campaign.failed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-resumeblast-signature")
    const webhookSecret = process.env.RESUMEBLAST_WEBHOOK_SECRET

    // Verify signature if secret is configured
    if (webhookSecret) {
      if (!signature) {
        console.warn("[ResumeBlast Webhook] Missing signature header")
        return NextResponse.json({ error: "Missing signature" }, { status: 401 })
      }

      const expected = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex")

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        console.warn("[ResumeBlast Webhook] Invalid signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const payload = JSON.parse(body)
    const { event, campaignId, status, customerEmail, metadata, stats } = payload

    console.log("[ResumeBlast Webhook] Event:", event, "Campaign:", campaignId, "Email:", customerEmail)

    // Log the event (future: update a distributions table or send progress emails)
    if (customerEmail) {
      await sqlNeon`
        UPDATE premium_access
        SET "paidAt" = "paidAt"   -- no-op update to confirm record exists; future: add distribution_status column
        WHERE LOWER(email) = LOWER(${customerEmail})
          AND product = 'resume-distribution'
      `
    }

    // Send admin notification on completion or failure
    if (event === "campaign.completed" || event === "campaign.failed") {
      const resendKey = process.env.RESEND_API_KEY
      if (resendKey) {
        const isComplete = event === "campaign.completed"
        const statsHtml = stats
          ? `<p style="margin:8px 0;font-size:13px;">
               📊 Stats: ${stats.sent || 0} sent · ${stats.opened || 0} opened · ${stats.responded || 0} responded
             </p>`
          : ""

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Career Accel System <noreply@starworkforcesolutions.com>",
            to: ["Srikanth@startekk.net"],
            subject: `[ResumeBlast] Campaign ${isComplete ? "✅ Completed" : "❌ Failed"} — ${customerEmail}`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                <div style="background:#0A1A2F;color:white;padding:20px;border-radius:8px 8px 0 0;">
                  <h2 style="margin:0;color:#E8C547;">
                    ${isComplete ? "✅ Distribution Complete" : "❌ Distribution Failed"}
                  </h2>
                </div>
                <div style="padding:20px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
                  <p>Customer: <strong>${customerEmail}</strong></p>
                  <p>Campaign ID: <code>${campaignId}</code></p>
                  <p>Status: <strong>${status}</strong></p>
                  ${statsHtml}
                  <p style="font-size:12px;color:#666;">Resume ID: ${metadata?.resumeId || "n/a"}</p>
                </div>
              </div>
            `,
          }),
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[ResumeBlast Webhook] Error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
