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
  targetRoles: string
  targetLocations: string
  industry: string
  experience: string
  resumeDownloadUrl?: string
}): Promise<CampaignResult> {
  const apiKey = process.env.MAILERCLOUD_API_KEY
  const listId = process.env.MAILERCLOUD_LIST_ID
  const senderEmail = process.env.MAILERCLOUD_SENDER_EMAIL || "noreply@starworkforcesolutions.com"
  const senderName = process.env.MAILERCLOUD_SENDER_NAME || "STAR Workforce Solutions"

  // Feature-flagged -- only runs when Mailercloud credentials are configured
  if (!apiKey || !listId) {
    console.log("[Mailercloud] API not configured (MAILERCLOUD_API_KEY / MAILERCLOUD_LIST_ID missing) -- skipping recruiter blast for:", params.customerName)
    return { success: false, skipped: true }
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
        subject,
        html,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error("[Mailercloud] API error:", response.status, data)
      return { success: false, error: data.error || `HTTP ${response.status}` }
    }

    console.log("[Mailercloud] Campaign created:", data.id || data.campaign_id, "for", params.customerName)
    return { success: true, campaignId: data.id || data.campaign_id }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[Mailercloud] Unexpected error:", msg)
    return { success: false, error: msg }
  }
}
