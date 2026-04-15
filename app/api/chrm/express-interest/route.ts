import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"

export const dynamic = "force-dynamic"

/**
 * POST /api/chrm/express-interest
 *
 * Job seeker "Express Interest" in a CHRM NEXUS job listing.
 * - Records a candidate_submitted event in chrm_activity_events
 * - Sends notification email to admin (Srikanth) with job + applicant details
 * - Returns success status
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { job_id, job_title, company, location, work_model, rate_info } = body

    if (!job_id || !job_title) {
      return NextResponse.json(
        { error: "job_id and job_title are required" },
        { status: 400 }
      )
    }

    // Check if already expressed interest
    const existing = await sql`
      SELECT id FROM chrm_activity_events
      WHERE user_id = ${session.user.id}
        AND job_id = ${job_id}
        AND event_type = 'candidate_submitted'
      LIMIT 1
    `
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "You have already expressed interest in this job" },
        { status: 409 }
      )
    }

    // Check free tier weekly limit (5/week)
    // Users with an active recruiter subscription get unlimited
    const subResult = await sql`
      SELECT id FROM subscriptions
      WHERE user_id = ${session.user.id}
        AND status = 'active'
        AND subscription_type LIKE 'recruiter_%'
      LIMIT 1
    `
    const hasRecruiterPlan = subResult.rows.length > 0

    if (!hasRecruiterPlan) {
      const now = new Date()
      const dayOfWeek = now.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - daysToMonday)
      const weekStartStr = weekStart.toISOString().split("T")[0]

      const weeklyCount = await sql`
        SELECT COUNT(*) as total FROM chrm_activity_events
        WHERE user_id = ${session.user.id}
          AND event_type = 'candidate_submitted'
          AND created_at >= ${weekStartStr}::date
      `
      const count = parseInt(weeklyCount.rows[0]?.total || "0")
      const MAX_FREE_PER_WEEK = 5

      if (count >= MAX_FREE_PER_WEEK) {
        return NextResponse.json(
          {
            error: "Weekly application limit reached (5 per week on Free plan)",
            limit: MAX_FREE_PER_WEEK,
            used: count,
            message: "Upgrade to a recruiter plan for unlimited applications.",
          },
          { status: 429 }
        )
      }
    }

    // Record the application event
    const metadata = JSON.stringify({
      job_title,
      company: company || "Unknown",
      location: location || "Unknown",
      work_model: work_model || "Unknown",
      rate_info: rate_info || null,
      applicant_name: session.user.name || "Unknown",
      applicant_email: session.user.email,
      applied_at: new Date().toISOString(),
    })

    await sql`
      INSERT INTO chrm_activity_events (user_id, job_id, event_type, metadata)
      VALUES (${session.user.id}, ${job_id}, 'candidate_submitted', ${metadata}::jsonb)
    `

    // Send notification email to admin
    try {
      const resendKey = process.env.RESEND_API_KEY
      if (resendKey) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Career Accel <noreply@starworkforcesolutions.com>",
            to: ["Srikanth@startekk.net", "info@startekk.net"],
            subject: `New Job Interest: ${session.user.name || session.user.email} → ${job_title}`,
            html: `
              <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f4f4f4;">
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #0A1A2F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="margin: 0; color: #E8C547;">New Job Interest Submitted</h2>
                </div>
                <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                  <h3 style="color: #0A1A2F; margin-top: 0;">Applicant Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #666;">Name:</td><td style="padding: 8px 0; font-weight: bold;">${session.user.name || "Not provided"}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0; font-weight: bold;"><a href="mailto:${session.user.email}">${session.user.email}</a></td></tr>
                  </table>

                  <h3 style="color: #0A1A2F; margin-top: 20px;">Job Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #666;">Job Title:</td><td style="padding: 8px 0; font-weight: bold;">${job_title}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Company:</td><td style="padding: 8px 0;">${company || "Not specified"}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Location:</td><td style="padding: 8px 0;">${location || "Not specified"}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Work Model:</td><td style="padding: 8px 0;">${work_model || "Not specified"}</td></tr>
                    ${rate_info ? `<tr><td style="padding: 8px 0; color: #666;">Rate:</td><td style="padding: 8px 0;">${rate_info}</td></tr>` : ""}
                    <tr><td style="padding: 8px 0; color: #666;">Job ID:</td><td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${job_id}</td></tr>
                  </table>

                  <div style="margin-top: 20px; padding: 12px; background: #f0f4f8; border-radius: 6px;">
                    <p style="margin: 0; font-size: 13px; color: #666;">
                      This interest was submitted via the Career Accel Platform job seeker dashboard.
                      Review and follow up with the applicant as needed.
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
              </body></html>
            `,
          }),
        })
      }
    } catch (emailError) {
      // Don't fail the request if email fails
      console.error("[Express Interest] Email notification failed:", emailError)
    }

    return NextResponse.json({
      success: true,
      message: "Interest submitted successfully. Our team will review your application.",
    })
  } catch (error) {
    console.error("[Express Interest] POST error:", error)
    return NextResponse.json(
      { error: "Failed to submit interest", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
