import { type NextRequest, NextResponse } from "next/server"
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, email, subject, message, submittedAt } = data

    console.log("[Contact] Form submission received:", {
      name,
      email,
      subject,
      timestamp: submittedAt || new Date().toISOString(),
    })

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      )
    }

    // Format subject label
    const subjectLabels: Record<string, string> = {
      'general': 'General Inquiry',
      'ats-optimizer': 'ATS Optimizer',
      'cover-letter': 'Cover Letter Generator',
      'resume-distribution': 'Resume Distribution Service',
      'hire-recruiter-basic': 'Hire Recruiter - Basic Plan',
      'hire-recruiter-standard': 'Hire Recruiter - Standard Plan',
      'hire-recruiter-pro': 'Hire Recruiter - Pro Plan',
      'interview-prep': 'Interview Preparation',
      'job-search': 'Job Search Assistance',
      'employer-services': 'Employer/Recruiting Services',
      'billing': 'Billing & Payments',
      'technical-support': 'Technical Support',
      'partnership': 'Partnership Opportunities',
      'feedback': 'Feedback & Suggestions',
    }

    const subjectLabel = subjectLabels[subject] || subject

    // Send email via Resend
    const { data: emailData, error } = await resend.emails.send({
      from: 'STAR Workforce Contact <info@starworkforcesolutions.com>',
      to: ['info@starworkforcesolutions.com'],
      replyTo: email,
      subject: `[Contact Form] ${subjectLabel} - from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A1A2F; padding: 20px; text-align: center;">
            <h1 style="color: #E8C547; margin: 0;">STAR Workforce Solutions</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #0A1A2F; border-bottom: 2px solid #E8C547; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            <table style="width: 100%; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Name:</td>
                <td style="padding: 8px 0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Subject:</td>
                <td style="padding: 8px 0;">${subjectLabel}</td>
              </tr>
            </table>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <h3 style="color: #0A1A2F; margin-top: 0;">Message:</h3>
              <p style="white-space: pre-wrap; color: #333;">${message}</p>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              Submitted at: ${submittedAt || new Date().toISOString()}
            </p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subjectLabel}

Message:
${message}

Submitted at: ${submittedAt || new Date().toISOString()}
      `,
    })

    if (error) {
      console.error("[Contact] Resend error:", error)
      return NextResponse.json(
        { 
          success: true, 
          message: "Your message was received. If you don't hear back within 48 hours, please email info@starworkforcesolutions.com directly.",
          warning: "Email delivery pending"
        },
        { status: 200 }
      )
    }

    console.log("[Contact] Email sent successfully:", emailData)

    return NextResponse.json(
      { success: true, message: "Message sent successfully! We'll respond within 24 hours." },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("[Contact] Error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to send message. Please email info@starworkforcesolutions.com directly." 
      },
      { status: 500 }
    )
  }
}
