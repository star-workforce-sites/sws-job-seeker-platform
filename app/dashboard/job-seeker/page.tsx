import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getDashboardData(userEmail: string) {
  try {
    // Get user info
    const userResult = await sql`
      SELECT id, name, email, role, "atsPremium"
      FROM users
      WHERE LOWER(email) = LOWER(${userEmail})
      LIMIT 1
    `;

    if (userResult.rowCount === 0) {
      return null;
    }

    const user = userResult.rows[0];

    // Get application count
    const appCountResult = await sql`
      SELECT COUNT(*) as count
      FROM applications
      WHERE "userId" = ${user.id}
    `;

    const applicationCount = parseInt(appCountResult.rows[0]?.count || '0');

    // Get today's application count
    const today = new Date().toISOString().split('T')[0];
    const todayCountResult = await sql`
      SELECT COALESCE(SUM(count), 0) as total
      FROM application_limits
      WHERE "userId" = ${user.id} AND date = ${today}
    `;

    const todayCount = parseInt(todayCountResult.rows[0]?.total || '0');

    return {
      user,
      applicationCount,
      todayCount,
      isPremium: user.atsPremium || false,
    };
  } catch (error) {
    console.error('[Dashboard] Error fetching data:', error);
    return null;
  }
}

export default async function JobSeekerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const data = await getDashboardData(session.user.email);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A1A2F] to-[#132A47] flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">Unable to load dashboard data</p>
          <Link href="/auth/login" className="text-[#E8C547] hover:underline">
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  const { user, applicationCount, todayCount, isPremium } = data;
  const maxDailyApplications = isPremium ? 'Unlimited' : '5';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1A2F] to-[#132A47] flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#E8C547] mb-2">
            Welcome back, {user.name || 'Job Seeker'}!
          </h1>
          <p className="text-gray-300">
            {isPremium ? 'Premium Account' : 'Free Account'} - Track your applications and find your next opportunity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm mb-1">Applications Sent</p>
                <p className="text-4xl font-bold text-[#0A1A2F]">{applicationCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm mb-1">Today's Applications</p>
                <p className="text-4xl font-bold text-[#0A1A2F]">
                  {todayCount} <span className="text-lg text-gray-500">/ {maxDailyApplications}</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-[#E8C547] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#0A1A2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm mb-1">Profile Views</p>
                <p className="text-4xl font-bold text-[#0A1A2F]">0</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#E8C547] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Link href="/jobs">
              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer group">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-700 transition">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#0A1A2F] mb-2">Browse Jobs</h3>
                <p className="text-gray-600 text-sm">Find your next opportunity</p>
              </div>
            </Link>

            <Link href="/dashboard/job-seeker/applications">
              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer group">
                <div className="w-12 h-12 bg-[#E8C547] rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-500 transition">
                  <svg className="w-6 h-6 text-[#0A1A2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#0A1A2F] mb-2">My Applications</h3>
                <p className="text-gray-600 text-sm">Track your job applications ({applicationCount} total)</p>
              </div>
            </Link>

            <Link href="/dashboard/job-seeker/profile">
              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer group">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-700 transition">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#0A1A2F] mb-2">Edit Profile</h3>
                <p className="text-gray-600 text-sm">Update your information</p>
              </div>
            </Link>

          </div>
        </div>

        {/* Upgrade Section (only for free users) */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white shadow-lg">
            <h2 className="text-3xl font-bold mb-4">Upgrade Your Account</h2>
            <p className="mb-6 text-lg">
              Get access to premium features and unlimited applications. Increase your chances of landing your dream job!
            </p>
            <Link href="/pricing">
              <button className="bg-[#E8C547] text-[#0A1A2F] px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-400 transition shadow-lg">
                View Premium Plans
              </button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
