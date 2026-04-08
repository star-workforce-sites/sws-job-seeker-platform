/**
 * ResumeBlast.ai API integration for Career Accel Platform
 *
 * Triggered after a successful Resume Distribution purchase.
 * Gated by RESUMEBLAST_API_URL + RESUMEBLAST_API_KEY env vars.
 * When those vars are not set, the function logs a skip and returns gracefully.
 *
 * Full API spec: ResumeBlast_Integration_Spec.md in project root.
 */

import { neon } from "@neondatabase/serverless"
import { getDbUrl } from "@/lib/db"

const sqlNeon = neon(getDbUrl())

interface DistributionResult {
  success: boolean
  campaignId?: string
  status?: string
  estimatedStartTime?: string
  error?: string
  skipped?: boolean
}

/**
 * Calls the ResumeBlast.ai API to trigger resume distribution.
 * Fetches the resume file from resume_uploads using the resumeId.
 *
 * @param params  Metadata from Stripe checkout session
 */
export async function triggerResumeDistribution(params: {
  resumeId: string
  email: string
  customerName: string
  targetRoles: string
  targetLocations: string
  industry: string
  experience: string
  stripePaymentId?: string
}): Promise<DistributionResult> {
  const apiUrl = process.env.RESUMEBLAST_API_URL
  const apiKey = process.env.RESUMEBLAST_API_KEY

  // Feature-flagged — only runs when API credentials are configured
  if (!apiUrl || !apiKey) {
    console.log("[ResumeBlast] API not configured — skipping automatic distribution for:", params.email)
    return { success: false, skipped: true }
  }

  if (!params.resumeId) {
    console.error("[ResumeBlast] No resumeId in metadata — cannot fetch file")
    return { success: false, error: "Missing resumeId" }
  }

  try {
    // 1. Fetch resume file from DB
    const rows = await sqlNeon`
      SELECT "fileName", "fileContent", "fileType"
      FROM resume_uploads
      WHERE id = ${params.resumeId}
      LIMIT 1
    `

    if (!rows || rows.length === 0) {
      console.error("[ResumeBlast] Resume not found for ID:", params.resumeId)
      return { success: false, error: "Resume file not found" }
    }

    const resume = rows[0]

    // 2. Build the distribution request
    const payload = {
      source: "career-accel",
      callbackUrl: `${process.env.NEXT_PUBLIC_URL || "https://www.starworkforcesolutions.com"}/api/resume-distribution-webhook`,
      customer: {
        email: params.email,
        name: params.customerName,
      },
      resume: {
        fileName: resume.fileName,
        fileType: resume.fileType,
        fileContent: resume.fileContent, // already base64 in DB
      },
      targeting: {
        targetRoles: params.targetRoles,
        targetLocations: params.targetLocations,
        industry: params.industry,
        experience: params.experience,
      },
      metadata: {
        resumeId: params.resumeId,
        stripePaymentId: params.stripePaymentId || "",
        purchasedAt: new Date().toISOString(),
      },
    }

    // 3. Call ResumeBlast API
    const response = await fetch(`${apiUrl}/distribute`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[ResumeBlast] API error:", response.status, data)
      return { success: false, error: data.error || `HTTP ${response.status}` }
    }

    console.log("[ResumeBlast] Distribution triggered:", data.campaignId, "for", params.email)
    return {
      success: true,
      campaignId: data.campaignId,
      status: data.status,
      estimatedStartTime: data.estimatedStartTime,
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[ResumeBlast] Unexpected error:", msg)
    return { success: false, error: msg }
  }
}
