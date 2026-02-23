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
      to: 'jobs@starworkforcesolutions.com',
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

// ── Plan details helper ───────────────────────────────────────
export function getPlanDetails(subscriptionType: string): {
  name: string
  amount: string
  applicationsPerDay: number
} {
  const plans: Record<string, { name: string; amount: string; applicationsPerDay: number }> = {
    recruiter_basic:    { name: 'Recruiter Basic',    amount: '199', applicationsPerDay: 4  },
    recruiter_standard: { name: 'Recruiter Standard', amount: '399', applicationsPerDay: 12 },
    recruiter_pro:      { name: 'Recruiter Pro',      amount: '599', applicationsPerDay: 25 },
    diy_premium:        { name: 'DIY Premium',        amount: '9.99', applicationsPerDay: 0 },
  }
  return plans[subscriptionType] || { name: subscriptionType, amount: '0', applicationsPerDay: 0 }
}
