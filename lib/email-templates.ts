// Email Templates for Hire-a-Recruiter Service
// Uses Resend API for email delivery

interface SubscriptionConfirmationParams {
  jobSeekerName: string
  jobSeekerEmail: string
  planName: string
  planAmount: string
  subscriptionId: string
}

interface AdminNotificationParams {
  jobSeekerName: string
  jobSeekerEmail: string
  planName: string
  subscriptionId: string
  subscribedAt: string
}

// ── NEW: Template 3 params ───────────────────────────────────
interface AssignmentConfirmationJobSeekerParams {
  jobSeekerName: string
  recruiterName: string
  recruiterEmail: string
  planName: string
  applicationsPerDay: number
}

// ── NEW: Template 4 params ───────────────────────────────────
interface AssignmentNotificationRecruiterParams {
  recruiterName: string
  jobSeekerName: string
  jobSeekerEmail: string
  planName: string
  applicationsPerDay: number
  assignedAt: string
  notes?: string | null
}


// ── NEW: Welcome email params ─────────────────────────────────
interface WelcomeNewUserParams {
  userName: string
  userEmail: string
}

export const emailTemplates = {

  // ── Template 1: Subscription Confirmation (to Job Seeker) ──
  subscriptionConfirmation: (params: SubscriptionConfirmationParams) => ({
    subject: `Welcome to ${params.planName} - Your Recruiter Will Be Assigned Soon`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0A1A2F 0%, #132A47 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: #E8C547; margin: 0; font-size: 28px;">STAR Workforce Solutions</h1>
    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Thank You for Subscribing!</p>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #0A1A2F; margin-top: 0;">Hi ${params.jobSeekerName},</h2>
    <p style="font-size: 16px; color: #374151;">Thank you for subscribing to our <strong>${params.planName}</strong>!</p>
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #0A1A2F; margin-top: 0;">What Happens Next:</h3>
      <ol style="color: #374151; padding-left: 20px;">
        <li style="margin-bottom: 10px;">Our team will assign a dedicated recruiter within <strong>24-48 hours</strong></li>
        <li style="margin-bottom: 10px;">You'll receive an introduction email with your recruiter's contact info</li>
        <li style="margin-bottom: 10px;">Your recruiter will start submitting applications immediately</li>
        <li style="margin-bottom: 10px;">You'll receive email notifications for each submission and status update</li>
      </ol>
    </div>
    <div style="background: #E8C547; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #0A1A2F; margin-top: 0;">Your Plan Details:</h3>
      <table style="width: 100%; color: #0A1A2F;">
        <tr><td style="padding: 5px 0;"><strong>Plan:</strong></td><td style="padding: 5px 0;">${params.planName}</td></tr>
        <tr><td style="padding: 5px 0;"><strong>Monthly Cost:</strong></td><td style="padding: 5px 0;">$${params.planAmount}</td></tr>
        <tr><td style="padding: 5px 0;"><strong>Subscription ID:</strong></td><td style="padding: 5px 0; font-size: 12px;">${params.subscriptionId}</td></tr>
      </table>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://www.starworkforcesolutions.com/dashboard/job-seeker"
         style="display: inline-block; background: #E8C547; color: #0A1A2F; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        View Your Dashboard
      </a>
    </div>
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      <strong>Questions?</strong><br>
      Reply to this email or contact us at
      <a href="mailto:support@starworkforcesolutions.com" style="color: #E8C547;">support@starworkforcesolutions.com</a>
    </p>
    <p style="color: #374151; margin-top: 20px;">Best regards,<br><strong>STAR Workforce Solutions Team</strong></p>
  </div>
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>STAR Workforce Solutions<br>
    <a href="https://www.starworkforcesolutions.com" style="color: #E8C547;">www.starworkforcesolutions.com</a></p>
  </div>
</body>
</html>
    `,
  }),

  // ── Template 2: Admin Notification ─────────────────────────
  adminNotification: (params: AdminNotificationParams) => ({
    subject: `🚨 ACTION REQUIRED: New Subscription - Assign Recruiter`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #dc2626; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">⚠️ NEW SUBSCRIPTION ALERT</h1>
    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Action Required Within 48 Hours</p>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #0A1A2F; margin-top: 0;">New Subscription Received</h2>
    <p style="font-size: 16px; color: #374151;">A new job seeker has subscribed and needs a recruiter assigned.</p>
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
      <h3 style="color: #0A1A2F; margin-top: 0;">Job Seeker Details:</h3>
      <table style="width: 100%; color: #374151;">
        <tr><td style="padding: 5px 0; font-weight: bold;">Name:</td><td style="padding: 5px 0;">${params.jobSeekerName}</td></tr>
        <tr><td style="padding: 5px 0; font-weight: bold;">Email:</td><td style="padding: 5px 0;">${params.jobSeekerEmail}</td></tr>
        <tr><td style="padding: 5px 0; font-weight: bold;">Plan:</td><td style="padding: 5px 0;"><strong>${params.planName}</strong></td></tr>
        <tr><td style="padding: 5px 0; font-weight: bold;">Subscribed:</td><td style="padding: 5px 0;">${params.subscribedAt}</td></tr>
        <tr><td style="padding: 5px 0; font-weight: bold;">Subscription ID:</td><td style="padding: 5px 0; font-size: 12px;">${params.subscriptionId}</td></tr>
      </table>
    </div>
    <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <h3 style="margin: 0 0 15px 0;">⚡ ACTION REQUIRED</h3>
      <p style="margin: 0 0 20px 0;">Assign a recruiter within 48 hours</p>
      <a href="https://www.starworkforcesolutions.com/dashboard/admin"
         style="display: inline-block; background: #ffffff; color: #dc2626; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Go to Admin Panel
      </a>
    </div>
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h4 style="color: #0A1A2F; margin-top: 0; font-size: 14px;">Next Steps:</h4>
      <ol style="color: #374151; font-size: 14px; margin: 10px 0; padding-left: 20px;">
        <li>Log into admin panel</li>
        <li>Go to the Unassigned tab</li>
        <li>Select available recruiter</li>
        <li>Assign to ${params.jobSeekerName}</li>
        <li>System will send intro emails automatically</li>
      </ol>
    </div>
    <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">This is an automated notification. Do not reply to this email.</p>
  </div>
</body>
</html>
    `,
  }),

  // ── Template 3: Recruiter Assigned - to Job Seeker ──────────
  assignmentConfirmationJobSeeker: (params: AssignmentConfirmationJobSeekerParams) => ({
    subject: `✅ Your Recruiter Has Been Assigned - ${params.planName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0A1A2F 0%, #132A47 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: #E8C547; margin: 0; font-size: 28px;">STAR Workforce Solutions</h1>
    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Your Recruiter Is Ready!</p>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #0A1A2F; margin-top: 0;">Hi ${params.jobSeekerName},</h2>
    <p style="font-size: 16px; color: #374151;">
      Great news! A dedicated recruiter has been assigned to your <strong>${params.planName}</strong> subscription
      and will begin submitting applications on your behalf right away.
    </p>

    <div style="background: #E8C547; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #0A1A2F; margin-top: 0;">Your Dedicated Recruiter:</h3>
      <table style="width: 100%; color: #0A1A2F;">
        <tr><td style="padding: 5px 0;"><strong>Name:</strong></td><td style="padding: 5px 0;">${params.recruiterName}</td></tr>
        <tr><td style="padding: 5px 0;"><strong>Email:</strong></td><td style="padding: 5px 0;">${params.recruiterEmail}</td></tr>
        <tr><td style="padding: 5px 0;"><strong>Daily Target:</strong></td><td style="padding: 5px 0;">${params.applicationsPerDay} applications/day</td></tr>
      </table>
    </div>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #0A1A2F; margin-top: 0;">What Happens Now:</h3>
      <ol style="color: #374151; padding-left: 20px;">
        <li style="margin-bottom: 10px;">Your recruiter will begin submitting consulting &amp; contract applications today</li>
        <li style="margin-bottom: 10px;">You'll receive email updates for every application submitted</li>
        <li style="margin-bottom: 10px;">Track all submissions in real time on your dashboard</li>
        <li style="margin-bottom: 10px;">Contact your recruiter directly at <a href="mailto:${params.recruiterEmail}" style="color: #0A1A2F;">${params.recruiterEmail}</a> with any questions</li>
      </ol>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://www.starworkforcesolutions.com/dashboard/job-seeker"
         style="display: inline-block; background: #E8C547; color: #0A1A2F; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        View Your Dashboard
      </a>
    </div>

    <div style="background: #fef3c7; border-left: 4px solid #E8C547; padding: 15px; border-radius: 0 8px 8px 0; margin: 20px 0;">
      <p style="color: #374151; margin: 0; font-size: 14px;">
        <strong>Important:</strong> All applications submitted comply with DOL regulations.
        Your recruiter will never guarantee employment or job placement outcomes.
        Applications target consulting and contract roles only.
      </p>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      <strong>Questions?</strong><br>
      Contact us at <a href="mailto:support@starworkforcesolutions.com" style="color: #E8C547;">support@starworkforcesolutions.com</a>
    </p>
    <p style="color: #374151; margin-top: 20px;">Best regards,<br><strong>STAR Workforce Solutions Team</strong></p>
  </div>
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>STAR Workforce Solutions<br>
    <a href="https://www.starworkforcesolutions.com" style="color: #E8C547;">www.starworkforcesolutions.com</a></p>
  </div>
</body>
</html>
    `,
  }),

  // ── Template 4: New Assignment - to Recruiter ───────────────
  assignmentNotificationRecruiter: (params: AssignmentNotificationRecruiterParams) => ({
    subject: `📋 New Client Assigned: ${params.jobSeekerName} - ${params.planName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0A1A2F 0%, #132A47 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: #E8C547; margin: 0; font-size: 24px;">STAR Workforce Solutions</h1>
    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">New Client Assignment</p>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #0A1A2F; margin-top: 0;">Hi ${params.recruiterName},</h2>
    <p style="font-size: 16px; color: #374151;">
      A new client has been assigned to you. Please begin submitting applications as soon as possible.
    </p>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
      <h3 style="color: #0A1A2F; margin-top: 0;">Client Details:</h3>
      <table style="width: 100%; color: #374151;">
        <tr><td style="padding: 5px 0; font-weight: bold; width: 40%;">Name:</td><td style="padding: 5px 0;">${params.jobSeekerName}</td></tr>
        <tr><td style="padding: 5px 0; font-weight: bold;">Email:</td><td style="padding: 5px 0;">${params.jobSeekerEmail}</td></tr>
        <tr><td style="padding: 5px 0; font-weight: bold;">Plan:</td><td style="padding: 5px 0;"><strong>${params.planName}</strong></td></tr>
        <tr><td style="padding: 5px 0; font-weight: bold;">Daily Target:</td><td style="padding: 5px 0;"><strong>${params.applicationsPerDay} applications/day</strong></td></tr>
        <tr><td style="padding: 5px 0; font-weight: bold;">Assigned:</td><td style="padding: 5px 0;">${params.assignedAt}</td></tr>
        ${params.notes ? `<tr><td style="padding: 5px 0; font-weight: bold;">Notes:</td><td style="padding: 5px 0;">${params.notes}</td></tr>` : ''}
      </table>
    </div>

    <div style="background: #0A1A2F; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #E8C547; margin-top: 0;">Your Responsibilities:</h3>
      <ul style="color: #ffffff; padding-left: 20px; margin: 0;">
        <li style="margin-bottom: 8px;">Submit <strong>${params.applicationsPerDay} consulting &amp; contract applications per day</strong></li>
        <li style="margin-bottom: 8px;">Log every submission in the recruiter dashboard immediately</li>
        <li style="margin-bottom: 8px;">Update application status as responses are received</li>
        <li style="margin-bottom: 8px;">Contact the client directly for any questions about their preferences</li>
        <li style="margin-bottom: 8px;">Never guarantee employment outcomes — DOL compliance required</li>
      </ul>
    </div>

    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h4 style="color: #0A1A2F; margin-top: 0; font-size: 14px;">DOL Compliance Reminder:</h4>
      <p style="color: #374151; font-size: 13px; margin: 0;">
        Use only approved status values when logging submissions: submitted, confirmed, under_review,
        screening_scheduled, screening_completed, interview_scheduled, interview_completed,
        second_interview_scheduled, assessment_scheduled, assessment_completed,
        references_requested, not_selected, no_response, position_closed, application_withdrawn.
        <strong>Never use: hired, job_secured, placement_confirmed, offer_accepted, employment_guaranteed.</strong>
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://www.starworkforcesolutions.com/dashboard/recruiter"
         style="display: inline-block; background: #E8C547; color: #0A1A2F; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        Go to Recruiter Dashboard
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Questions? Contact admin at <a href="mailto:jobs@starworkforcesolutions.com" style="color: #E8C547;">jobs@starworkforcesolutions.com</a>
    </p>
    <p style="color: #374151; margin-top: 20px;">Best regards,<br><strong>STAR Workforce Solutions Admin Team</strong></p>
  </div>
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>STAR Workforce Solutions<br>
    <a href="https://www.starworkforcesolutions.com" style="color: #E8C547;">www.starworkforcesolutions.com</a></p>
  </div>
</body>
</html>
    `,
  }),
  // ── Template 5: Welcome email → New User ────────────────────
  welcomeNewUser: (params: WelcomeNewUserParams) => ({
    subject: `Welcome to STAR Workforce Solutions!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0A1A2F 0%, #132A47 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: #E8C547; margin: 0; font-size: 28px;">STAR Workforce Solutions</h1>
    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Welcome to the Platform!</p>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #0A1A2F; margin-top: 0;">Hi ${params.userName},</h2>
    <p style="font-size: 16px; color: #374151;">
      Your account has been created successfully. Welcome to STAR Workforce Solutions!
    </p>
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #0A1A2F; margin-top: 0;">What You Can Do:</h3>
      <ul style="color: #374151; padding-left: 20px; margin: 0;">
        <li style="margin-bottom: 8px;">Search and apply for jobs</li>
        <li style="margin-bottom: 8px;">Optimize your resume with our ATS tool</li>
        <li style="margin-bottom: 8px;">Prepare for interviews</li>
        <li style="margin-bottom: 8px;">Hire a dedicated recruiter to apply on your behalf</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://www.starworkforcesolutions.com/dashboard/job-seeker"
         style="display: inline-block; background: #E8C547; color: #0A1A2F; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        Go to Dashboard
      </a>
    </div>
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Questions? Contact us at
      <a href="mailto:support@starworkforcesolutions.com" style="color: #E8C547;">support@starworkforcesolutions.com</a>
    </p>
    <p style="color: #374151; margin-top: 20px;">Best regards,<br><strong>STAR Workforce Solutions Team</strong></p>
  </div>
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>STAR Workforce Solutions<br>
    <a href="https://www.starworkforcesolutions.com" style="color: #E8C547;">www.starworkforcesolutions.com</a></p>
  </div>
</body>
</html>
    `,
  }),

}
