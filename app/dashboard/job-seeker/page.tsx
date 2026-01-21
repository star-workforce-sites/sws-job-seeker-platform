'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';

export default function JobSeekerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login?callbackUrl=/dashboard/job-seeker');
      return;
    }

    // Database stores 'jobseeker' (no underscore)
    // Also allow if role is undefined (default to jobseeker)
    const role = session.user?.role;
    if (role && role !== 'jobseeker' && role !== 'admin') {
      console.log('[JobSeekerDashboard] Wrong role:', role, '- redirecting to /dashboard');
      router.push('/dashboard');
      return;
    }

    setIsAuthorized(true);
  }, [session, status, router]);

  if (status === 'loading' || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0A1A2F] to-[#132A47]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8C547]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.name || 'there'}!
          </h2>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your job search
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <a
            href="/tools/ats-optimizer"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="w-12 h-12 bg-[#E8C547] rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#0A1A2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ATS Optimizer</h3>
            <p className="text-gray-600 text-sm">Optimize your resume for applicant tracking systems</p>
          </a>

          <a
            href="/tools/cover-letter"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="w-12 h-12 bg-[#E8C547] rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#0A1A2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cover Letter Generator</h3>
            <p className="text-gray-600 text-sm">Create compelling cover letters in seconds</p>
          </a>

          <a
            href="/hire-recruiter"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="w-12 h-12 bg-[#E8C547] rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#0A1A2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hire a Recruiter</h3>
            <p className="text-gray-600 text-sm">Get a dedicated recruiter to find jobs for you</p>
          </a>

          <a
            href="/tools/interview-prep"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="w-12 h-12 bg-[#E8C547] rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#0A1A2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Interview Prep</h3>
            <p className="text-gray-600 text-sm">Practice with AI-powered mock interviews</p>
          </a>

          <a
            href="/jobs"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="w-12 h-12 bg-[#E8C547] rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#0A1A2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Job Search</h3>
            <p className="text-gray-600 text-sm">Browse and apply to consulting & contract jobs</p>
          </a>

          <a
            href="/distribution-wizard"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="w-12 h-12 bg-[#E8C547] rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#0A1A2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Resume Distribution</h3>
            <p className="text-gray-600 text-sm">Send your resume to 500+ recruiters</p>
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Resumes Optimized</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Cover Letters</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Applications Sent</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Current Plan</p>
            <p className="text-xl font-bold text-[#E8C547] mt-2">
              {session?.user?.atsPremium ? 'Premium' : 'Free'}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
