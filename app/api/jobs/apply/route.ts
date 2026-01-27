import { type NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/jobs/apply - Submit job application
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobId, notes } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    console.log('[Apply API] Application received:', { jobId, userEmail: session.user.email });

    // Get user ID
    const userResult = await sql`
      SELECT id, name, email FROM users 
      WHERE LOWER(email) = LOWER(${session.user.email})
      LIMIT 1
    `;

    if (userResult.rowCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];
    const userId = user.id;

    // Get job details for email
    const jobResult = await sql`
      SELECT 
        j.id,
        j.title,
        j.description,
        j.location,
        j."employmentType",
        j."salaryMin",
        j."salaryMax",
        j."employerId",
        u.name as "companyName",
        u.email as "employerEmail"
      FROM jobs j
      LEFT JOIN users u ON j."employerId" = u.id
      WHERE j.id = ${jobId}::uuid
      LIMIT 1
    `;

    if (jobResult.rowCount === 0) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const job = jobResult.rows[0];

    // Check if already applied
    const existingApp = await sql`
      SELECT id FROM applications 
      WHERE "userId" = ${userId} AND "jobId" = ${jobId}::uuid
    `;

    if (existingApp.rowCount > 0) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 409 }
      );
    }

    // Check daily application limit (free users: 5/day)
    const isPremium = await checkPremiumStatus(userId);

    if (!isPremium) {
      const today = new Date().toISOString().split('T')[0];
      const countResult = await sql`
        SELECT COALESCE(SUM(count), 0) as total
        FROM application_limits
        WHERE "userId" = ${userId} AND date = ${today}
      `;

      const dailyCount = parseInt(countResult.rows[0]?.total || '0');
      const MAX_FREE_APPLICATIONS = 5;

      if (dailyCount >= MAX_FREE_APPLICATIONS) {
        return NextResponse.json(
          {
            error: 'Daily application limit reached',
            limit: MAX_FREE_APPLICATIONS,
            message: 'Upgrade to premium for unlimited applications.',
          },
          { status: 429 }
        );
      }
    }

    // Create application
    const result = await sql`
      INSERT INTO applications ("userId", "jobId", notes, status, "appliedAt", "updatedAt")
      VALUES (${userId}, ${jobId}::uuid, ${notes || null}, 'applied', NOW(), NOW())
      RETURNING id, "jobId", status, "appliedAt"
    `;

    const application = result.rows[0];

    // Update daily limit counter
    if (!isPremium) {
      const today = new Date().toISOString().split('T')[0];
      await sql`
        INSERT INTO application_limits ("userId", date, count)
        VALUES (${userId}, ${today}, 1)
        ON CONFLICT ("userId", date)
        DO UPDATE SET count = application_limits.count + 1
      `;
    }

    // Send email notifications (don't block the response)
    sendApplicationEmails({
      applicant: {
        name: user.name || 'Job Seeker',
        email: user.email,
      },
      job: {
        id: job.id,
        title: job.title,
        company: job.companyName || 'Company',
        location: job.location,
        employmentType: job.employmentType,
      },
      employer: {
        name: job.companyName || 'Hiring Manager',
        email: job.employerEmail,
      },
      applicationDate: application.appliedAt,
    }).catch(error => {
      console.error('[Apply API] Email notification error:', error);
      // Don't fail the application if email fails
    });

    console.log('[Apply API] Application created successfully:', application.id);

    return NextResponse.json(
      {
        success: true,
        application: application,
        message: 'Application submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Apply API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

// GET /api/jobs/apply - Check if user has applied to a job
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ applied: false }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get user ID from database
    const userResult = await sql`
      SELECT id FROM users 
      WHERE LOWER(email) = LOWER(${session.user.email})
      LIMIT 1
    `;

    if (userResult.rowCount === 0) {
      return NextResponse.json({ applied: false }, { status: 200 });
    }

    const userId = userResult.rows[0].id;

    // Check if applied
    const result = await sql`
      SELECT id, "appliedAt", status 
      FROM applications 
      WHERE "userId" = ${userId} AND "jobId" = ${jobId}::uuid
      LIMIT 1
    `;

    return NextResponse.json(
      {
        applied: result.rowCount > 0,
        application: result.rowCount > 0 ? result.rows[0] : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Apply Check] Error:', error);
    return NextResponse.json({ applied: false }, { status: 200 });
  }
}

// Helper function to check premium status
async function checkPremiumStatus(userId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT "atsPremium" FROM users 
      WHERE id = ${userId}
      LIMIT 1
    `;

    return result.rows[0]?.atsPremium || false;
  } catch (error) {
    console.error('[Premium Check] Error:', error);
    return false;
  }
}

// Email notification function
async function sendApplicationEmails(data: {
  applicant: { name: string; email: string };
  job: { id: string; title: string; company: string; location: string; employmentType: string };
  employer: { name: string; email: string | null };
  applicationDate: string;
}) {
  const { applicant, job, employer, applicationDate } = data;

  const formattedDate = new Date(applicationDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Email to applicant (confirmation)
  const applicantEmail = resend.emails.send({
    from: 'STAR Workforce Solutions <jobs@starworkforcesolutions.com>',
    to: [applicant.email],
    subject: `Application Submitted: ${job.title} at ${job.company}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0A1A2F; padding: 20px; text-align: center;">
          <h1 style="color: #E8C547; margin: 0;">STAR Workforce Solutions</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #0A1A2F;">Application Submitted Successfully!</h2>
          
          <p>Dear ${applicant.name},</p>
          
          <p>Your application has been successfully submitted for the following position:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0A1A2F; margin-top: 0;">${job.title}</h3>
            <p style="margin: 5px 0;"><strong>Company:</strong> ${job.company}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${job.location}</p>
            <p style="margin: 5px 0;"><strong>Type:</strong> ${job.employmentType}</p>
            <p style="margin: 5px 0;"><strong>Applied:</strong> ${formattedDate}</p>
          </div>
          
          <p><strong>What's next?</strong></p>
          <ul>
            <li>The employer will review your application</li>
            <li>You'll be notified if they're interested</li>
            <li>Track your applications in your dashboard</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.starworkforcesolutions.com/dashboard/job-seeker/applications" 
               style="background: #E8C547; color: #0A1A2F; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View My Applications
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated confirmation email from STAR Workforce Solutions.
          </p>
        </div>
      </div>
    `,
  });

  // Email to employer (new applicant notification)
  let employerEmail = null;
  
  if (employer.email) {
    employerEmail = resend.emails.send({
      from: 'STAR Workforce Solutions <jobs@starworkforcesolutions.com>',
      to: [employer.email],
      subject: `New Application: ${applicant.name} for ${job.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A1A2F; padding: 20px; text-align: center;">
            <h1 style="color: #E8C547; margin: 0;">STAR Workforce Solutions</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #0A1A2F;">New Job Application Received</h2>
            
            <p>Dear ${employer.name},</p>
            
            <p>You have received a new application for your job posting:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0A1A2F; margin-top: 0;">${job.title}</h3>
              <p style="margin: 10px 0;"><strong>Applicant:</strong> ${applicant.name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${applicant.email}</p>
              <p style="margin: 10px 0;"><strong>Applied:</strong> ${formattedDate}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://www.starworkforcesolutions.com/employer/dashboard" 
                 style="background: #E8C547; color: #0A1A2F; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Application
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated notification from STAR Workforce Solutions.
            </p>
          </div>
        </div>
      `,
    });
  }

  // Wait for both emails to send
  const results = await Promise.allSettled([applicantEmail, employerEmail].filter(Boolean));
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`[Email ${index + 1}] Sent successfully:`, result.value);
    } else {
      console.error(`[Email ${index + 1}] Failed:`, result.reason);
    }
  });
}
