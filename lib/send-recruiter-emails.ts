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
