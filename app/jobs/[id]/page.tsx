import { notFound } from 'next/navigation';
import { sql } from '@vercel/postgres';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { ApplyButton } from '@/components/apply-button';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Force dynamic rendering for up-to-date data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  industry: string;
  employmentType: string;
  visa: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  employerId: string;
  company: string;
}

// Server-side data fetching
async function getJob(id: string): Promise<Job | null> {
  try {
    console.log('[Job Detail SSR] Fetching job:', id);
    
    const result = await sql`
      SELECT 
        j.id,
        j.title,
        j.description,
        j.location,
        j.industry,
        j."employmentType",
        j.visa,
        j."salaryMin",
        j."salaryMax",
        j."createdAt",
        j."expiresAt",
        j."isActive",
        j."employerId",
        COALESCE(u.name, 'Anonymous Company') as company
      FROM jobs j
      LEFT JOIN users u ON j."employerId" = u.id
      WHERE j.id = ${id}::uuid
        AND j."isActive" = TRUE
        AND j."expiresAt" > NOW()
      LIMIT 1
    `;

    if (result.rowCount === 0) {
      console.log('[Job Detail SSR] Job not found:', id);
      return null;
    }

    const job = result.rows[0];
    
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      industry: job.industry,
      employmentType: job.employmentType,
      visa: job.visa,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      createdAt: job.createdAt,
      expiresAt: job.expiresAt,
      isActive: job.isActive,
      employerId: job.employerId,
      company: job.company,
    };
  } catch (error) {
    console.error('[Job Detail SSR] Error fetching job:', error);
    return null;
  }
}

async function checkIfApplied(jobId: string, userEmail: string | null | undefined): Promise<boolean> {
  if (!userEmail) return false;

  try {
    const userResult = await sql`
      SELECT id FROM users 
      WHERE LOWER(email) = LOWER(${userEmail})
      LIMIT 1
    `;

    if (userResult.rowCount === 0) return false;

    const userId = userResult.rows[0].id;

    const result = await sql`
      SELECT id FROM applications 
      WHERE "userId" = ${userId} AND "jobId" = ${jobId}::uuid
      LIMIT 1
    `;

    return result.rowCount > 0;
  } catch (error) {
    console.error('[Job Detail SSR] Error checking application:', error);
    return false;
  }
}

export default async function JobDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Await params for Next.js 15+
  const { id } = await params;
  
  // Get session for auth state
  const session = await getServerSession(authOptions);
  
  // Fetch job data server-side
  const job = await getJob(id);
  
  if (!job) {
    notFound();
  }

  // Check if user already applied
  const hasApplied = await checkIfApplied(id, session?.user?.email);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Back Button */}
        <a
          href="/jobs"
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-2 inline-block"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </a>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <div className="flex flex-wrap gap-4 text-blue-100">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {job.company}
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {job.employmentType}
              </span>
              {job.industry && (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {job.industry}
                </span>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* Salary - Server-side rendered with proper null checks */}
            {(job.salaryMin !== null || job.salaryMax !== null) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Compensation</h2>
                <p className="text-3xl font-bold text-green-600">
                  {job.salaryMin !== null && job.salaryMax !== null ? (
                    <>
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                      <span className="text-lg text-gray-600 font-normal"> per year</span>
                    </>
                  ) : job.salaryMin !== null ? (
                    <>
                      From ${job.salaryMin.toLocaleString()}
                      <span className="text-lg text-gray-600 font-normal"> per year</span>
                    </>
                  ) : job.salaryMax !== null ? (
                    <>
                      Up to ${job.salaryMax.toLocaleString()}
                      <span className="text-lg text-gray-600 font-normal"> per year</span>
                    </>
                  ) : null}
                </p>
              </div>
            )}

            {/* Apply Button - Client component */}
            <div className="mb-8">
              <ApplyButton jobId={id} hasApplied={hasApplied} />
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>

            {/* Visa Sponsorship */}
            {job.visa && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Visa Sponsorship</h2>
                <p className="text-gray-700">{job.visa}</p>
              </div>
            )}

            {/* Posted Date */}
            <div className="text-sm text-gray-500 border-t pt-4">
              Posted: {new Date(job.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    return {
      title: 'Job Not Found | Star Workforce Solutions',
    };
  }

  return {
    title: `${job.title} - ${job.company} | Star Workforce Solutions`,
    description: `${job.title} in ${job.location}. ${job.description.substring(0, 150)}...`,
    openGraph: {
      title: `${job.title} - ${job.company}`,
      description: job.description.substring(0, 200),
      type: 'website',
    },
  };
}
