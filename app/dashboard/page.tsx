'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRouter() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Redirect based on role
    // Database stores: 'jobseeker', 'employer', 'admin', 'recruiter'
    const role = session.user?.role;
    
    console.log('[Dashboard] User role:', role);
    
    switch (role) {
      case 'admin':
        router.push('/dashboard/admin');
        break;
      case 'recruiter':
        router.push('/dashboard/recruiter');
        break;
      case 'employer':
        router.push('/employer/dashboard');
        break;
      case 'jobseeker':
      default:
        // Default to job-seeker dashboard for jobseeker role or any unrecognized role
        router.push('/dashboard/job-seeker');
        break;
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0A1A2F] to-[#132A47]">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8C547] mx-auto mb-4"></div>
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
