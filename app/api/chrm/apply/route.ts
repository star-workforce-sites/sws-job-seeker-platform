import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"

export const dynamic = "force-dynamic"

const ADMIN_EMAILS = ["Srikanth@startekk.net", "info@startekk.net"]

const CHRM_APPLY_URL = "https://us-central1-chrm-nexus.cloudfunctions.net/applyToJob"

/**
 * Calls CHRM NEXUS's applyToJob endpoint — this is the ONLY supported way to get
 * a real (unmasked) recruiter email address, per the CHRM NEXUS API update
 * (2026.09). getJobs.employer_email is masked as of 15 July 2026 and must never
 * be used to send mail — see CHRM_NEXUS_API_Update_CareerAccel_20260906.
 */
async function callChrmApplyToJob(params: {
  job_id: string
  applicant_name: string
  applicant_email: string
  cover_letter?: string | null
}): Promise<
  | { ok: true; employer_email: string | null; chrm_application_id: string }
  | { ok: false; status: number; reason: "not_found" | "expired" | "auth" | "error" }
> {
  const apiKey = process.env.CHRM_NEXUS_API_KEY || process.env.CHRM_API_KEY
  if (!apiKey) {
    console.error("[CHRM Apply] Neither CHRM_NEXUS_API_KEY nor CHRM_API_KEY configured")
    return { ok: false, status: 503, reason: "error" }
  }

  try {
    const res = await fetch(CHRM_APPLY_URL, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        job_id: params.job_id,
        applicant_name: params.applicant_name,
        applicant_email: params.applicant_email,
        cover_letter: params.cover_letter ?? undefined,
        source_platform: "career-accel",
      }),
    })

    if (res.status === 201) {
      const data = await res.json()
      return {
        ok: true,
        employer_email: data.employer_email ?? null,
        chrm_application_id: data.application_id ?? "N/A",
      }
    }
    if (res.status === 404) return { ok: false, status: 404, reason: "not_found" }
    if (res.status === 410) return { ok: false, status: 410, reason: "expired" }
    if (res.status === 401 || res.status === 403) {
      console.error("[CHRM Apply] Auth error calling applyToJob:", res.status)
      return { ok: false, status: res.status, reason: "auth" }
    }
    console.error("[CHRM Apply] applyToJob error:", res.status, await res.text().catch(() => ""))
    return { ok: false, status: res.status, reason: "error" }
  } catch (err) {
    console.error("[CHRM Apply] applyToJob request failed:", err)
    return { ok: false, status: 500, reason: "error" }
  }
}

// ── Email helper ─────────────────────────────────────────────
async function sendEmail(payload: {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}) {
  const key = process.env.RESEND_API_KEY
  if (!key) return
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Career Accel <noreply@starworkforcesolutions.com>",
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.replyTo,
      }),
    })
  } catch (err) {
    console.error("[CHRM Apply] Email send failed:", err)
  }
}

/**
 * POST /api/chrm/apply
 *
 * Unified direct-apply for CHRM NEXUS jobs.
 * - Saves application record to job_applications
 * - Also records chrm_activity_events for deduplication + rate limiting (unchanged)
 * - Emails applicant a confirmation
 * - Emails employer directly if employer_email present in CHRM API data
 * - Always emails admin team so nothing falls through the cracks
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      job_id,
      job_title,
      company,
      location,
      work_model,
      rate_info,
      // employer_email from the client is the getJobs listing value — NEVER used to
      // send mail (it's masked as of 15 July 2026). Kept only as a pre-CHRM-call
      // fallback label; the real address always comes from callChrmApplyToJob below.
      resume_id,        // UUID from resume_uploads — optional
      resume_name,      // filename for display
      cover_note,       // optional short message
    } = body

    if (!job_id || !job_title) {
      return NextResponse.json({ error: "job_id and job_title are required" }, { status: 400 })
    }

    const userId = session.user.id
    const applicantEmail = session.user.email
    const applicantName = session.user.name || applicantEmail

    // ── Call CHRM NEXUS applyToJob for the REAL recruiter address ──
    // This is the supported, unchanged flow per the Sep 2026 API update.
    // getJobs.employer_email is masked and must not be used for sending mail.
    const chrmResult = await callChrmApplyToJob({
      job_id,
      applicant_name: applicantName,
      applicant_email: applicantEmail,
      cover_letter: cover_note ?? null,
    })

    if (!chrmResult.ok) {
      if (chrmResult.reason === "not_found" || chrmResult.reason === "expired") {
        return NextResponse.json(
          {
            error:
              chrmResult.reason === "expired"
                ? "This job listing has expired. Please refresh your job list."
                : "This job listing is no longer available. Please refresh your job list.",
          },
          { status: 410 }
        )
      }
      // auth/error: don't silently fail the candidate — record locally without a
      // verified employer address so admin can follow up, but tell the truth about it.
      console.error("[CHRM Apply] applyToJob failed, falling back to admin-only routing:", chrmResult)
    }

    const employer_email = chrmResult.ok ? chrmResult.employer_email : null
    const chrmApplicationId = chrmResult.ok ? chrmResult.chrm_application_id : null

    // ── Rate limiting: reuse existing chrm_activity_events ───
    // Check if already applied (dedup)
    const existing = await sql`
      SELECT id FROM chrm_activity_events
      WHERE user_id = ${userId}
        AND job_id  = ${job_id}
        AND event_type = 'candidate_submitted'
      LIMIT 1
    `
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 409 }
      )
    }

    // Free tier: 5 applications per week
    const subResult = await sql`
      SELECT id FROM subscriptions
      WHERE user_id = ${userId}
        AND status = 'active'
        AND subscription_type LIKE 'recruiter_%'
      LIMIT 1
    `
    const hasRecruiterPlan = subResult.rows.length > 0

    if (!hasRecruiterPlan) {
      const now = new Date()
      const daysToMonday = now.getDay() === 0 ? 6 : now.getDay() - 1
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - daysToMonday)
      const weekStartStr = weekStart.toISOString().split("T")[0]

      const weeklyCount = await sql`
        SELECT COUNT(*) AS total FROM chrm_activity_events
        WHERE user_id    = ${userId}
          AND event_type = 'candidate_submitted'
          AND created_at >= ${weekStartStr}::date
      `
      const count = parseInt(weeklyCount.rows[0]?.total || "0")
      if (count >= 5) {
        return NextResponse.json(
          {
            error: "Weekly limit reached (5/week on Free plan). Upgrade for unlimited applications.",
            limit: 5,
            used: count,
          },
          { status: 429 }
        )
      }
    }

    // ── Write application record ──────────────────────────────
    // Insert into job_applications (unique per user+job)
    const appInsert = await sql`
      INSERT INTO job_applications (
        user_id, job_id, job_title, company, location, work_model,
        rate_info, resume_id, resume_name, cover_note, employer_email
      )
      VALUES (
        ${userId}::uuid,
        ${job_id},
        ${job_title},
        ${company ?? null},
        ${location ?? null},
        ${work_model ?? null},
        ${rate_info ?? null},
        ${resume_id ?? null},
        ${resume_name ?? null},
        ${cover_note ?? null},
        ${employer_email ?? null}
      )
      ON CONFLICT (user_id, job_id) DO NOTHING
      RETURNING id
    `

    // Also record in chrm_activity_events for deduplication & analytics (existing system)
    const metadata = JSON.stringify({
      job_title,
      company: company ?? "Unknown",
      location: location ?? "Unknown",
      work_model: work_model ?? "Unknown",
      rate_info: rate_info ?? null,
      applicant_name: applicantName,
      applicant_email: applicantEmail,
      resume_id: resume_id ?? null,
      applied_at: new Date().toISOString(),
    })
    await sql`
      INSERT INTO chrm_activity_events (user_id, job_id, event_type, metadata)
      VALUES (${userId}, ${job_id}, 'candidate_submitted', ${metadata}::jsonb)
    `

    // ── Send emails (non-blocking, don't fail the request) ────
    const applicationId = appInsert.rows[0]?.id ?? "N/A"
    const appliedAt = new Date().toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    })

    const jobSummaryRows = [
      ["Job Title", job_title],
      ["Company", company ?? "Not specified"],
      ["Location", location ?? "Not specified"],
      ["Work Model", work_model ?? "Not specified"],
      ...(rate_info ? [["Rate", rate_info]] : []),
    ]
    const jobSummaryHtml = jobSummaryRows
      .map(([k, v]) => `<tr><td style="padding:6px 0;color:#666;width:120px">${k}</td><td style="padding:6px 0;font-weight:600">${v}</td></tr>`)
      .join("")

    // 1. Confirmation to applicant
    sendEmail({
      to: applicantEmail,
      subject: `Application Submitted: ${job_title}${company ? ` at ${company}` : ""}`,
      html: `
        <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f4f4f4;">
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0A1A2F;padding:20px 24px;border-radius:8px 8px 0 0">
            <h2 style="margin:0;color:#E8C547;font-size:20px">Application Submitted ✓</h2>
          </div>
          <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
            <p style="margin:0 0 16px">Hi ${applicantName},</p>
            <p style="margin:0 0 16px">Your application has been submitted. Here's what we captured:</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">${jobSummaryHtml}</table>
            ${cover_note ? `<div style="background:#f9fafb;border-left:3px solid #E8C547;padding:12px 16px;margin-bottom:20px;border-radius:0 4px 4px 0"><p style="margin:0 0 4px;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.5px">Your cover note</p><p style="margin:0;font-size:14px">${cover_note}</p></div>` : ""}
            ${employer_email
              ? `<p style="color:#16a34a;font-size:14px">✅ Your application was sent directly to the employer.</p>`
              : `<p style="font-size:14px;color:#555">Our team has been notified and will forward your application to the employer. We'll be in touch with any updates.</p>`
            }
            <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb">
              <p style="font-size:12px;color:#999;margin:0">Career Accel Platform · STAR Workforce Solutions</p>
            </div>
          </div>
        </div>
        </body></html>
      `,
    })

    // 2. Direct email to employer (only if CHRM provided employer_email)
    if (employer_email) {
      sendEmail({
        to: employer_email,
        replyTo: applicantEmail,
        subject: `New Application: ${applicantName} for ${job_title}`,
        html: `
          <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f4f4f4;">
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#0A1A2F;padding:20px 24px;border-radius:8px 8px 0 0">
              <h2 style="margin:0;color:#E8C547;font-size:20px">New Job Application</h2>
              <p style="margin:6px 0 0;color:#fff;opacity:.8;font-size:14px">via Career Accel Platform</p>
            </div>
            <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
              <h3 style="margin:0 0 16px;color:#0A1A2F">Applicant Details</h3>
              <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
                <tr><td style="padding:6px 0;color:#666;width:120px">Name</td><td style="padding:6px 0;font-weight:600">${applicantName}</td></tr>
                <tr><td style="padding:6px 0;color:#666">Email</td><td style="padding:6px 0"><a href="mailto:${applicantEmail}" style="color:#0A1A2F">${applicantEmail}</a></td></tr>
                <tr><td style="padding:6px 0;color:#666">Applied</td><td style="padding:6px 0">${appliedAt}</td></tr>
              </table>
              <h3 style="margin:0 0 12px;color:#0A1A2F">Position</h3>
              <table style="width:100%;border-collapse:collapse;margin-bottom:20px">${jobSummaryHtml}</table>
              ${cover_note ? `<div style="background:#f9fafb;border-left:3px solid #E8C547;padding:12px 16px;border-radius:0 4px 4px 0"><p style="margin:0 0 4px;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.5px">Applicant's message</p><p style="margin:0;font-size:14px">${cover_note}</p></div>` : ""}
              <p style="margin-top:20px;font-size:13px;color:#555">To contact this applicant, reply directly to this email — your reply goes to ${applicantEmail}.</p>
            </div>
          </div>
          </body></html>
        `,
      })
    }

    // 3. Admin notification (always — so nothing falls through)
    sendEmail({
      to: ADMIN_EMAILS,
      subject: `[Apply] ${applicantName} → ${job_title}${company ? ` at ${company}` : ""}`,
      html: `
        <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f4f4f4;">
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0A1A2F;padding:20px 24px;border-radius:8px 8px 0 0">
            <h2 style="margin:0;color:#E8C547;font-size:18px">New Direct Application</h2>
          </div>
          <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <tr><td style="padding:6px 0;color:#666;width:140px">Applicant</td><td style="padding:6px 0;font-weight:600">${applicantName} — <a href="mailto:${applicantEmail}">${applicantEmail}</a></td></tr>
              <tr><td style="padding:6px 0;color:#666">Job Title</td><td style="padding:6px 0;font-weight:600">${job_title}</td></tr>
              <tr><td style="padding:6px 0;color:#666">Company</td><td style="padding:6px 0">${company ?? "—"}</td></tr>
              <tr><td style="padding:6px 0;color:#666">Location</td><td style="padding:6px 0">${location ?? "—"}</td></tr>
              ${rate_info ? `<tr><td style="padding:6px 0;color:#666">Rate</td><td style="padding:6px 0">${rate_info}</td></tr>` : ""}
              <tr><td style="padding:6px 0;color:#666">Employer email</td><td style="padding:6px 0">${employer_email ? `<span style="color:#16a34a">✅ ${employer_email} — emailed directly</span>` : `<span style="color:#dc2626">❌ Not provided — manual follow-up needed</span>`}</td></tr>
              <tr><td style="padding:6px 0;color:#666">Resume attached</td><td style="padding:6px 0">${resume_name ? `✅ ${resume_name}` : "None uploaded"}</td></tr>
              <tr><td style="padding:6px 0;color:#666">Plan type</td><td style="padding:6px 0">${hasRecruiterPlan ? "Recruiter plan" : "Free"}</td></tr>
              <tr><td style="padding:6px 0;color:#666">App ID</td><td style="padding:6px 0;font-family:monospace;font-size:12px">${applicationId}</td></tr>
              <tr><td style="padding:6px 0;color:#666">CHRM App ID</td><td style="padding:6px 0;font-family:monospace;font-size:12px">${chrmApplicationId ?? "not recorded (CHRM call failed — see server logs)"}</td></tr>
            </table>
            ${cover_note ? `<div style="background:#f9fafb;border-left:3px solid #E8C547;padding:12px 16px;border-radius:0 4px 4px 0"><p style="margin:0 0 4px;font-size:12px;color:#666">Cover note from applicant</p><p style="margin:0;font-size:14px">${cover_note}</p></div>` : ""}
          </div>
        </div>
        </body></html>
      `,
    })

    return NextResponse.json({
      success: true,
      message: employer_email
        ? "Application sent directly to the employer."
        : "Application submitted. Our team will follow up with the employer.",
      routed_to_employer: !!employer_email,
      application_id: applicationId,
    })
  } catch (error) {
    console.error("[CHRM Apply] POST error:", error)
    return NextResponse.json(
      { error: "Failed to submit application", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/chrm/apply?job_id=xxx
 * Check if the current user has already applied to a specific CHRM job.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ applied: false })
    }
    const jobId = new URL(request.url).searchParams.get("job_id")
    if (!jobId) return NextResponse.json({ applied: false })

    const result = await sql`
      SELECT id, applied_at, status FROM job_applications
      WHERE user_id = ${session.user.id}::uuid
        AND job_id  = ${jobId}
      LIMIT 1
    `
    return NextResponse.json({
      applied: result.rows.length > 0,
      application: result.rows[0] ?? null,
    })
  } catch {
    return NextResponse.json({ applied: false })
  }
}
