/**
 * Mailercloud API integration for recruiter email blasts (Resume Distribution).
 *
 * Feature-flagged: gated by MAILERCLOUD_API_KEY + MAILERCLOUD_LIST_ID env vars.
 * When those are not set, the function logs a skip and returns gracefully --
 * same safe pattern as lib/resumeblast.ts.
 *
 * STILL OPEN / NOT DECIDED YET (do not assume -- confirm with the user before
 * relying on this in production):
 *   1. Which list(s) to send to -- MAILERCLOUD_LIST_ID currently means "one
 *      list, no filtering." If sends should be a filtered subset by
 *      industry/role instead of all ~1,400 recruiters, that requires either
 *      multiple Mailercloud lists (one per segment) or a Mailercloud segment
 *      ID passed alongside list_ids -- needs the user to confirm how the
 *      1,400-contact import was actually organized on the Mailercloud side.
 *   2. Whether the 1,400-recruiter list has already been imported into
 *      Mailercloud, and whether existing suppression/unsubscribe/bounce data
 *      needs to be preserved on import.
 *   3. Sending cadence/rate limits -- depends on the Mailercloud plan tier,
 *      which needs to be read from the Mailercloud dashboard, not assumed.
 *
 * API docs: https://apidoc.mailercloud.com/
 */

import { neon } from "@neondatabase/serverless"
import { getDbUrl } from "@/lib/db"
import { sendReplyIdMissingAlertEmail } from "@/lib/send-recruiter-emails"

const sqlNeon = neon(getDbUrl())

const MAILERCLOUD_BASE_URL = "https://cloudapi.mailercloud.com/v1"

interface CampaignResult {
  success: boolean
  campaignId?: string
  error?: string
  skipped?: boolean
}

/**
 * Creates (and Mailercloud auto-sends) a campaign to the configured list,
 * announcing a newly distributed resume to recruiters.
 */
export async function triggerRecruiterEmailBlast(params: {
  customerName: string
  customerEmail: string
  targetRoles: string
  targetLocations: string
  industry: string
  experience: string
  resumeDownloadUrl?: string
  stripeSessionId: string
}): Promise<CampaignResult> {
  const apiKey = process.env.MAILERCLOUD_API_KEY
  const listId = process.env.MAILERCLOUD_LIST_ID
  // From address stays on our verified/authenticated domain (required by Mailercloud
  // sender authentication), but the display name and Reply-To are mapped to the
  // candidate so recruiters see the candidate's name and can reply directly to them.
  const senderEmail = process.env.MAILERCLOUD_SENDER_EMAIL || "noreply@starworkforcesolutions.com"
  const senderName = params.customerName || process.env.MAILERCLOUD_SENDER_NAME || "STAR Workforce Solutions"
  const replyEmail = params.customerEmail

  // Feature-flagged -- only runs when Mailercloud credentials are configured
  if (!apiKey || !listId) {
    console.log("[Mailercloud] API not configured (MAILERCLOUD_API_KEY / MAILERCLOUD_LIST_ID missing) -- skipping recruiter blast for:", params.customerName)
    return { success: false, skipped: true }
  }

  // Log this attempt up front (status 'pending') so we have a durable record
  // even if the process crashes before we get a response back.
  try {
    await sqlNeon`
      INSERT INTO recruiter_blast_log (
        stripe_session_id, customer_name, customer_email, target_roles,
        target_locations, industry, experience, status
      ) VALUES (
        ${params.stripeSessionId}, ${params.customerName}, ${params.customerEmail},
        ${params.targetRoles}, ${params.targetLocations}, ${params.industry},
        ${params.experience}, 'pending'
      )
      ON CONFLICT (stripe_session_id) DO NOTHING
    `
  } catch (logErr) {
    console.error("[Mailercloud] Failed to write initial blast-log row (non-blocking):", logErr)
  }

  try {
    const subject = `New Candidate Available: ${params.targetRoles || "Multiple Roles"} (${params.experience || "Experience varies"})`
    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #0A1A2F;">New Candidate Available</h2>
  <p><strong>Target Role(s):</strong> ${params.targetRoles || "Not specified"}</p>
  <p><strong>Target Location(s):</strong> ${params.targetLocations || "Not specified"}</p>
  <p><strong>Industry:</strong> ${params.industry || "Not specified"}</p>
  <p><strong>Experience:</strong> ${params.experience || "Not specified"}</p>
  ${params.resumeDownloadUrl ? `<p><a href="${params.resumeDownloadUrl}" style="color: #E8C547;">View Resume</a></p>` : ""}
  <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Sent via STAR Workforce Solutions Resume Distribution.</p>
</body>
</html>`

    const response = await fetch(`${MAILERCLOUD_BASE_URL}/campaign`, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `Resume Distribution - ${params.customerName} - ${new Date().toISOString()}`,
        list_ids: [listId],
        sender: { sender_email: senderEmail, sender_name: senderName },
        reply_email: replyEmail,
        subject,
        html,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error("[Mailercloud] API error:", response.status, data)
      const errors = Array.isArray(data.errors) ? data.errors : []
      const replyIdIssue = errors.find((e: any) => e.field === "reply_email")
      const status = replyIdIssue ? "failed_reply_id" : "failed_other"
      const errorMessage = replyIdIssue ? replyIdIssue.message : (data.error || `HTTP ${response.status}`)

      try {
        await sqlNeon`
          UPDATE recruiter_blast_log
          SET status = ${status}, error_message = ${errorMessage}
          WHERE stripe_session_id = ${params.stripeSessionId}
        `
      } catch (logErr) {
        console.error("[Mailercloud] Failed to update blast-log row (non-blocking):", logErr)
      }

      if (replyIdIssue) {
        // The candidate's email hasn't been manually added as a Mailercloud
        // Reply ID yet -- alert the admin so they can add it and retry,
        // instead of this failing silently.
        sendReplyIdMissingAlertEmail({
          customerName: params.customerName,
          customerEmail: params.customerEmail,
          stripeSessionId: params.stripeSessionId,
        }).catch((alertErr) => console.error("[Mailercloud] Failed to send reply-id-missing alert:", alertErr))
      }

      return { success: false, error: errorMessage }
    }

    const campaignId = data.id || data.campaign_id
    try {
      await sqlNeon`
        UPDATE recruiter_blast_log
        SET status = 'sent', campaign_id = ${campaignId}, sent_at = now()
        WHERE stripe_session_id = ${params.stripeSessionId}
      `
    } catch (logErr) {
      console.error("[Mailercloud] Failed to update blast-log row (non-blocking):", logErr)
    }

    console.log("[Mailercloud] Campaign created:", campaignId, "for", params.customerName)
    return { success: true, campaignId }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[Mailercloud] Unexpected error:", msg)
    try {
      await sqlNeon`
        UPDATE recruiter_blast_log
        SET status = 'failed_other', error_message = ${msg}
        WHERE stripe_session_id = ${params.stripeSessionId}
      `
    } catch (logErr) {
      console.error("[Mailercloud] Failed to update blast-log row (non-blocking):", logErr)
    }
    return { success: false, error: msg }
  }
}
