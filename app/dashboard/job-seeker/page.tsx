'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function JobSeekerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Check if user has correct role
    if (session.user?.role !== 'job_seeker') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8C547]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0A1A2F] border-b border-[#E8C547]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-[#E8C547]">STAR Workforce</h1>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/dashboard" className="text-white hover:text-[#E8C547] transition">
                Dashboard
              </a>
              <a href="/tools/ats-optimizer" className="text-white hover:text-[#E8C547] transition">
                ATS Optimizer
              </a>
              <a href="/tools/cover-letter" className="text-white hover:text-[#E8C547] transition">
                Cover Letter
              </a>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium">{session?.user?.name}</p>
              <p className="text-gray-400 text-xs">Job Seeker</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.name}!
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
            <p className="text-xl font-bold text-gray-900 mt-2">Free</p>
          </div>
        </div>
      </main>
    </div>
  );
}
