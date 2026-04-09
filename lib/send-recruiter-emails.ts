import { Resend } from 'resend'
import { emailTemplates } from './email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

// ── Template 1: Subscription confirmation → Job Seeker ───────
export async function sendSubscriptionConfirmationEmail(params: {
  jobSeekerName: string
  jobSeekerEmail: string
  planName: string
  planAmount: string
  subscriptionId: string
}) {
  try {
    const template = emailTemplates.subscriptionConfirmation(params)
    const result = await resend.emails.send({
      from: 'STAR Workforce <noreply@starworkforcesolutions.com>',
      to: params.jobSeekerEmail,
      subject: template.subject,
      html: template.html,
    })
    console.log('[Email] Subscription confirmation sent to:', params.jobSeekerEmail)
    return { success: true, result }
  } catch (error) {
    console.error('[Email] Failed to send subscription confirmation:', error)
    return { success: false, error }
  }
}

// ── Template 2: Admin alert → jobs@starworkforcesolutions.com ─
export async function sendAdminNotificationEmail(params: {
  jobSeekerName: string
  jobSeekerEmail: string
  planName: string
  subscriptionId: string
  subscribedAt: string
}) {
  try {
    const template = emailTemplates.adminNotification(params)
    const result = await resend.emails.send({
      from: 'STAR Workforce System <noreply@starworkforcesolutions.com>',
      to: ['Srikanth@startekk.net', 'info@startekk.net'],
      subject: template.subject,
      html: template.html,
    })
    console.log('[Email] Admin notification sent')
    return { success: true, result }
  } catch (error) {
    console.error('[Email] Failed to send admin notification:', error)
    return { success: false, error }
  }
}

// ── Template 3: Assignment confirmation → Job Seeker ─────────
export async function sendAssignmentConfirmationToJobSeeker(params: {
  jobSeekerName: string
  jobSeekerEmail: string
  recruiterName: string
  recruiterEmail: string
  planName: string
  applicationsPerDay: number
}) {
  try {
    const template = emailTemplates.assignmentConfirmationJobSeeker(params)
    const result = await resend.emails.send({
      from: 'STAR Workforce <noreply@starworkforcesolutions.com>',
      to: params.jobSeekerEmail,
      subject: template.subject,
      html: template.html,
    })
    console.log('[Email] Assignment confirmation sent to job seeker:', params.jobSeekerEmail)
    return { success: true, result }
  } catch (error) {
    console.error('[Email] Failed to send assignment confirmation to job seeker:', error)
    return { success: false, error }
  }
}

// ── Template 4: Assignment notification → Recruiter ──────────
export async function sendAssignmentNotificationToRecruiter(params: {
  recruiterName: string
  recruiterEmail: string
  jobSeekerName: string
  jobSeekerEmail: string
  planName: string
  applicationsPerDay: number
  assignedAt: string
  notes?: string | null
}) {
  try {
    const template = emailTemplates.assignmentNotificationRecruiter(params)
    const result = await resend.emails.send({
      from: 'STAR Workforce System <noreply@starworkforcesolutions.com>',
      to: params.recruiterEmail,
      subject: template.subject,
      html: template.html,
    })
    console.log('[Email] Assignment notification sent to recruiter:', params.recruiterEmail)
    return { success: true, result }
  } catch (error) {
    console.error('[Email] Failed to send assignment notification to recruiter:', error)
    return { success: false, error }
  }
}


// ── Welcome email → New registered user ──────────────────────
export async function sendWelcomeEmail(params: {
  userName: string
  userEmail: string
}) {
  try {
    const template = emailTemplates.welcomeNewUser(params)
    const result = await resend.emails.send({
      from: 'STAR Workforce <noreply@starworkforcesolutions.com>',
      to: params.userEmail,
      subject: template.subject,
      html: template.html,
    })
    console.log('[Email] Welcome email sent to:', params.userEmail)
    return { success: true, result }
  } catch (error) {
    console.error('[Email] Failed to send welcome email:', error)
    return { success: false, error }
  }
}

// ── Purchase notification → Admin (Srikanth@startekk.net) ────
export async function sendPurchaseNotificationEmail(params: {
  customerName: string
  customerEmail: string
  productName: string
  amount: string
  metadata?: Record<string, string>
}) {
  try {
    const { customerName, customerEmail, productName, amount, metadata = {} } = params
    const adminEmail = ['Srikanth@startekk.net', 'info@startekk.net']
    const dashboardUrl = 'https://www.starworkforcesolutions.com/dashboard/admin'

    // Build extra rows for resume distribution targeting info
    const extraRows = [
      metadata.targetRoles && `<tr><td style="padding:6px 0;color:#666;width:160px;">Target Roles:</td><td style="padding:6px 0;font-weight:500;">${metadata.targetRoles}</td></tr>`,
      metadata.targetLocations && `<tr><td style="padding:6px 0;color:#666;">Locations:</td><td style="padding:6px 0;font-weight:500;">${metadata.targetLocations}</td></tr>`,
      metadata.industry && `<tr><td style="padding:6px 0;color:#666;">Industry:</td><td style="padding:6px 0;">${metadata.industry}</td></tr>`,
      metadata.experience && `<tr><td style="padding:6px 0;color:#666;">Experience:</td><td style="padding:6px 0;">${metadata.experience} yrs</td></tr>`,
    ].filter(Boolean).join('\n')

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0A1A2F;color:white;padding:20px;border-radius:8px 8px 0 0;">
          <h2 style="margin:0;color:#E8C547;">💰 New Purchase — Career Accel</h2>
        </div>
        <div style="padding:20px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <p style="margin:0 0 16px;color:#374151;">A new purchase was just completed on the platform.</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#666;width:160px;">Customer:</td><td style="padding:6px 0;font-weight:bold;">${customerName}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Email:</td><td style="padding:6px 0;"><a href="mailto:${customerEmail}" style="color:#0A1A2F;">${customerEmail}</a></td></tr>
            <tr><td style="padding:6px 0;color:#666;">Product:</td><td style="padding:6px 0;font-weight:bold;color:#059669;">${productName}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Amount:</td><td style="padding:6px 0;font-weight:bold;font-size:16px;">$${amount}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Time:</td><td style="padding:6px 0;">${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', dateStyle: 'full', timeStyle: 'short' })} CT</td></tr>
            ${extraRows}
          </table>
          ${metadata.product === 'resume-distribution' ? `
          <div style="margin-top:16px;padding:12px;background:#fef3c7;border-radius:6px;border-left:4px solid #f59e0b;">
            <p style="margin:0;font-size:13px;color:#92400e;">
              <strong>Action needed:</strong> Manually fulfill the resume distribution for ${customerEmail}
              (or wait for ResumeBlast.ai API to be connected for automatic fulfillment).
            </p>
          </div>` : ''}
          <div style="margin-top:20px;text-align:center;">
            <a href="${dashboardUrl}" style="display:inline-block;background:#0A1A2F;color:#E8C547;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
              View Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    `

    const result = await resend.emails.send({
      from: 'Career Accel System <noreply@starworkforcesolutions.com>',
      to: adminEmail as string[],
      subject: `[New Purchase] ${productName} — ${customerEmail}`,
      html,
    })
    console.log('[Email] Purchase notification sent to admin for:', customerEmail, productName)
    return { success: true, result }
  } catch (error) {
    console.error('[Email] Failed to send purchase notification:', error)
    return { success: false, error }
  }
}

// ── Recruiter submission notification → Job Seeker + Admin ──────
export async function sendRecruiterSubmissionNotificationEmail(params: {
  jobSeekerName: string
  jobSeekerEmail: string
  recruiterName: string
  jobTitle: string
  companyName: string
  jobUrl?: string | null
  totalSubmissions?: number
}) {
  try {
    const { jobSeekerName, jobSeekerEmail, recruiterName, jobTitle, companyName, jobUrl, totalSubmissions } = params
    const adminEmail = ['Srikanth@startekk.net', 'info@startekk.net']
    const dashboardUrl = 'https://www.starworkforcesolutions.com/dashboard/job-seeker'

    // ── Email to job seeker ──────────────────────
    const seekerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0A1A2F;color:white;padding:20px;border-radius:8px 8px 0 0;">
          <h2 style="margin:0;color:#E8C547;">New Application Submitted</h2>
        </div>
        <div style="padding:20px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <p style="margin:0 0 16px;color:#374151;">Hi ${jobSeekerName || 'there'},</p>
          <p style="margin:0 0 16px;color:#374151;">Your recruiter <strong>${recruiterName}</strong> just submitted an application on your behalf:</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#666;width:120px;">Position:</td><td style="padding:6px 0;font-weight:bold;">${jobTitle}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Company:</td><td style="padding:6px 0;font-weight:bold;">${companyName}</td></tr>
            ${jobUrl ? `<tr><td style="padding:6px 0;color:#666;">Job Link:</td><td style="padding:6px 0;"><a href="${jobUrl}" style="color:#0A1A2F;">View Job Posting</a></td></tr>` : ''}
            ${totalSubmissions ? `<tr><td style="padding:6px 0;color:#666;">Total Apps:</td><td style="padding:6px 0;">${totalSubmissions} submitted so far</td></tr>` : ''}
          </table>
          <div style="margin-top:20px;text-align:center;">
            <a href="${dashboardUrl}" style="display:inline-block;background:#0A1A2F;color:#E8C547;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
              View Your Dashboard
            </a>
          </div>
          <p style="margin:16px 0 0;font-size:12px;color:#9CA3AF;">You're receiving this because you have a recruiter plan on Career Accel Platform.</p>
        </div>
      </div>
    `

    // ── Email to admin ───────────────────────────
    const adminHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0A1A2F;color:white;padding:20px;border-radius:8px 8px 0 0;">
          <h2 style="margin:0;color:#E8C547;">Recruiter Submission Logged</h2>
        </div>
        <div style="padding:20px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <p style="margin:0 0 16px;color:#374151;">A recruiter just logged a new application submission.</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#666;width:120px;">Recruiter:</td><td style="padding:6px 0;font-weight:bold;">${recruiterName}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Client:</td><td style="padding:6px 0;font-weight:bold;">${jobSeekerName || 'N/A'} (${jobSeekerEmail})</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Position:</td><td style="padding:6px 0;">${jobTitle}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Company:</td><td style="padding:6px 0;">${companyName}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Time:</td><td style="padding:6px 0;">${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', dateStyle: 'full', timeStyle: 'short' })} CT</td></tr>
          </table>
        </div>
      </div>
    `

    // Send both emails in parallel (fire-and-forget pattern)
    const [seekerResult, adminResult] = await Promise.allSettled([
      resend.emails.send({
        from: 'STAR Workforce <noreply@starworkforcesolutions.com>',
        to: jobSeekerEmail,
        subject: `New Application: ${jobTitle} at ${companyName}`,
        html: seekerHtml,
      }),
      resend.emails.send({
        from: 'Career Accel System <noreply@starworkforcesolutions.com>',
        to: adminEmail as string[],
        subject: `[Submission] ${recruiterName} → ${jobTitle} at ${companyName}`,
        html: adminHtml,
      }),
    ])

    console.log('[Email] Recruiter submission notifications sent for:', jobSeekerEmail, jobTitle)
    return { success: true, seekerResult, adminResult }
  } catch (error) {
    console.error('[Email] Failed to send recruiter submission notification:', error)
    return { success: false, error }
  }
}

// ── Profile update notification → Admin ─────────────────────────
export async function sendProfileUpdateNotificationEmail(params: {
  jobSeekerName: string
  jobSeekerEmail: string
  updatedFields: string[]
}) {
  try {
    const { jobSeekerName, jobSeekerEmail, updatedFields } = params
    const adminEmail = ['Srikanth@startekk.net', 'info@startekk.net']
    const dashboardUrl = 'https://www.starworkforcesolutions.com/dashboard/admin'

    const fieldsList = updatedFields.length > 0
      ? updatedFields.map(f => `<li style="padding:2px 0;color:#374151;">${f}</li>`).join('\n')
      : '<li style="padding:2px 0;color:#374151;">General profile update</li>'

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0A1A2F;color:white;padding:20px;border-radius:8px 8px 0 0;">
          <h2 style="margin:0;color:#E8C547;">Profile Updated — Career Accel</h2>
        </div>
        <div style="padding:20px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <p style="margin:0 0 16px;color:#374151;">A job seeker just updated their profile.</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#666;width:140px;">Name:</td><td style="padding:6px 0;font-weight:bold;">${jobSeekerName || 'Not set'}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Email:</td><td style="padding:6px 0;"><a href="mailto:${jobSeekerEmail}" style="color:#0A1A2F;">${jobSeekerEmail}</a></td></tr>
            <tr><td style="padding:6px 0;color:#666;">Time:</td><td style="padding:6px 0;">${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', dateStyle: 'full', timeStyle: 'short' })} CT</td></tr>
          </table>
          <div style="margin-top:12px;">
            <p style="margin:0 0 6px;font-weight:bold;color:#374151;">Fields Updated:</p>
            <ul style="margin:0;padding-left:20px;">
              ${fieldsList}
            </ul>
          </div>
          <div style="margin-top:20px;text-align:center;">
            <a href="${dashboardUrl}" style="display:inline-block;background:#0A1A2F;color:#E8C547;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
              View Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    `

    const result = await resend.emails.send({
      from: 'Career Accel System <noreply@starworkforcesolutions.com>',
      to: adminEmail as string[],
      subject: `[Profile Update] ${jobSeekerName || 'Job Seeker'} — ${jobSeekerEmail}`,
      html,
    })
    console.log('[Email] Profile update notification sent to admin for:', jobSeekerEmail)
    return { success: true, result }
  } catch (error) {
    console.error('[Email] Failed to send profile update notification:', error)
    return { success: false, error }
  }
}

// ── Plan details helper ───────────────────────────────────────
export function getPlanDetails(subscriptionType: string): {
  name: string
  amount: string
  applicationsPerDay: number
} {
  const plans: Record<string, { name: string; amount: string; applicationsPerDay: number }> = {
    recruiter_basic:    { name: 'Recruiter Basic',    amount: '199', applicationsPerDay: 4  },
    recruiter_standard: { name: 'Recruiter Standard', amount: '399', applicationsPerDay: 6  },
    recruiter_pro:      { name: 'Recruiter Pro',      amount: '599', applicationsPerDay: 10 },
    diy_premium:        { name: 'DIY Premium',        amount: '9.99', applicationsPerDay: 0 },
  }
  return plans[subscriptionType] || { name: subscriptionType, amount: '0', applicationsPerDay: 0 }
}
