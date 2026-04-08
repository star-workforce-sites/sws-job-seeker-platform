import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * POST /api/recruiter/notify
 *
 * Sends a notification email to a job seeker (CC recruiter) and optionally
 * updates an application_tracking row's status.
 *
 * Body:
 *   type           "screening" | "interview"
 *   client_id      UUID of the job seeker
 *   submission_id  (optional) UUID in application_tracking — if provided, status is updated
 *   job_title      Job title for the subject line
 *   company_name   Company name
 *   scheduled_at   ISO string — date/time of call or interview
 *   call_type      "phone" | "video" | "in_person" (interview only)
 *   message        Optional recruiter message / prep notes
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify requester is a recruiter
    const recruiterResult = await sql`
      SELECT id, name, email FROM users
      WHERE id = ${session.user.id}
        AND role = 'recruiter'
      LIMIT 1
    `
    if (recruiterResult.rows.length === 0) {
      return NextResponse.json({ error: "Forbidden — recruiter role required" }, { status: 403 })
    }
    const recruiter = recruiterResult.rows[0]

    const body = await request.json()
    const { type, client_id, submission_id, job_title, company_name, scheduled_at, call_type, message } = body

    if (!type || !client_id || !job_title || !company_name || !scheduled_at) {
      return NextResponse.json(
        { error: "type, client_id, job_title, company_name, and scheduled_at are required" },
        { status: 400 }
      )
    }

    // Verify this recruiter is assigned to this client
    const assignmentResult = await sql`
      SELECT id FROM recruiter_assignments
      WHERE recruiter_id = ${session.user.id}
        AND client_id = ${client_id}
        AND status = 'active'
      LIMIT 1
    `
    if (assignmentResult.rows.length === 0) {
      return NextResponse.json(
        { error: "You are not assigned to this client" },
        { status: 403 }
      )
    }

    // Get job seeker details
    const clientResult = await sql`
      SELECT id, name, email FROM users
      WHERE id = ${client_id}
      LIMIT 1
    `
    if (clientResult.rows.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    const client = clientResult.rows[0]

    // Format the scheduled date for email display
    const scheduledDate = new Date(scheduled_at)
    const formattedDate = scheduledDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    })

    // Determine new status and email content based on type
    let newStatus: string
    let emailSubject: string
    let emailHeading: string
    let callTypeLabel: string = ""

    if (type === "screening") {
      newStatus = "screening_scheduled"
      emailSubject = `Screening Call Scheduled: ${job_title} at ${company_name}`
      emailHeading = "Screening Call Scheduled"
    } else if (type === "interview") {
      newStatus = "interview_scheduled"
      const ctMap: Record<string, string> = {
        phone: "Phone Interview",
        video: "Video Interview",
        in_person: "In-Person Interview",
      }
      callTypeLabel = ctMap[call_type] || "Interview"
      emailSubject = `${callTypeLabel} Scheduled: ${job_title} at ${company_name}`
      emailHeading = `${callTypeLabel} Confirmed`
    } else {
      return NextResponse.json({ error: "Invalid type — must be 'screening' or 'interview'" }, { status: 400 })
    }

    // Update the submission status (if submission_id provided)
    let updatedSubmission = null
    if (submission_id) {
      const updateResult = await sql`
        UPDATE application_tracking
        SET status = ${newStatus}, updated_at = NOW()
        WHERE id = ${submission_id}
          AND client_id = ${client_id}
        RETURNING id, job_title, company_name, status
      `
      if (updateResult.rows.length > 0) {
        updatedSubmission = updateResult.rows[0]
      }
    }

    // Build email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0A1A2F; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; color: #E8C547;">🎉 ${emailHeading}</h2>
          <p style="margin: 8px 0 0; color: #ccc; font-size: 14px;">Career Accel Platform</p>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; background: #fff;">
          <p style="margin: 0 0 16px; font-size: 15px; color: #333;">
            Hi <strong>${client.name || "there"}</strong>,
          </p>
          <p style="margin: 0 0 16px; color: #555;">
            ${type === "screening"
              ? `Great news! Your dedicated recruiter has scheduled a screening call for the following opportunity:`
              : `Great news! Your dedicated recruiter has confirmed an interview for the following opportunity:`
            }
          </p>

          <div style="background: #f8f9fa; border-left: 4px solid #E8C547; padding: 16px; border-radius: 4px; margin: 0 0 20px;">
            <p style="margin: 0 0 8px; font-size: 18px; font-weight: bold; color: #0A1A2F;">${job_title}</p>
            <p style="margin: 0 0 4px; color: #555;"><strong>Company:</strong> ${company_name}</p>
            ${callTypeLabel ? `<p style="margin: 0 0 4px; color: #555;"><strong>Type:</strong> ${callTypeLabel}</p>` : ""}
            <p style="margin: 0 0 4px; color: #555;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 0; color: #555;"><strong>Time:</strong> ${formattedTime}</p>
          </div>

          ${message ? `
          <div style="margin: 0 0 20px;">
            <p style="font-weight: bold; color: #0A1A2F; margin: 0 0 8px;">Message from your recruiter:</p>
            <p style="color: #555; white-space: pre-wrap; margin: 0; background: #f0f4f8; padding: 12px; border-radius: 4px;">${message}</p>
          </div>
          ` : ""}

          <div style="background: #fffbeb; border: 1px solid #fbbf24; border-radius: 6px; padding: 12px; margin: 0 0 20px;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">
              <strong>Tips:</strong> ${type === "screening"
                ? "Be ready to discuss your background, skills, and what you're looking for. Review the job description beforehand."
                : "Research the company, prepare your STAR-method answers, and have questions ready for the interviewer."
              }
            </p>
          </div>

          <p style="color: #555; font-size: 14px;">
            Your recruiter <strong>${recruiter.name || recruiter.email}</strong> is available to help you prepare.
            Don't hesitate to reach out.
          </p>

          <div style="margin-top: 24px; text-align: center;">
            <a href="https://www.starworkforcesolutions.com/dashboard/job-seeker"
               style="display: inline-block; background: #0A1A2F; color: #E8C547; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              View My Dashboard
            </a>
          </div>

          <p style="margin-top: 24px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 16px;">
            This notification was sent by Career Accel Platform. Your recruiter: ${recruiter.name || recruiter.email} (${recruiter.email})
          </p>
        </div>
      </div>
    `

    // Send email via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      )
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Career Accel Platform <noreply@starworkforcesolutions.com>",
        to: [client.email],
        cc: [recruiter.email],
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    if (!emailRes.ok) {
      const emailErr = await emailRes.text()
      console.error("[Recruiter Notify] Email failed:", emailErr)
      return NextResponse.json(
        { error: "Failed to send notification email", details: emailErr },
        { status: 500 }
      )
    }

    console.log(`[Recruiter Notify] ${type} email sent to ${client.email} for ${job_title} @ ${company_name}`)

    return NextResponse.json({
      success: true,
      message: `${type === "screening" ? "Screening call" : "Interview"} notification sent to ${client.email}`,
      updatedSubmission,
      newStatus,
    })
  } catch (error) {
    console.error("[Recruiter Notify] Error:", error)
    return NextResponse.json(
      { error: "Failed to send notification", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
