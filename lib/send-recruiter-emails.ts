import { Resend } from 'resend'
import { emailTemplates } from './email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

// Email sending functions for recruiter service

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
      to: 'jobs@starworkforcesolutions.com', // Admin email
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

// Helper function to determine plan name and amount from subscription_type
export function getPlanDetails(subscriptionType: string): { name: string; amount: string } {
  const plans: Record<string, { name: string; amount: string }> = {
    'recruiter_basic': { name: 'Recruiter Basic', amount: '199' },
    'recruiter_standard': { name: 'Recruiter Standard', amount: '399' },
    'recruiter_pro': { name: 'Recruiter Pro', amount: '599' },
    'diy_premium': { name: 'DIY Premium', amount: '9.99' },
  }
  
  return plans[subscriptionType] || { name: subscriptionType, amount: '0' }
}
