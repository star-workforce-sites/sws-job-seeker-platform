'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { LoadingPage } from '@/components/loading';
import Link from 'next/link';

interface Application {
  id: string;
  job_id: string;
  job_title: string;
  company: string;
  location: string;
  status: string;
  applied_at: string;
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard/job-seeker/applications');
      return;
    }

    if (status === 'authenticated') {
      fetchApplications();
    }
  }, [status, router]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return <LoadingPage text="Loading applications..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-2">
            Track your job applications and their status
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No applications yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start applying to jobs to see them here
            </p>
            <Link href="/jobs">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Browse Jobs
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/jobs/${app.job_id}`}>
                      <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600">
                        {app.job_title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mt-1">{app.company}</p>
                    <p className="text-gray-500 text-sm mt-1">{app.location}</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      app.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                      app.status === 'reviewed' ? 'bg-yellow-100 text-yellow-700' :
                      app.status === 'interview' ? 'bg-green-100 text-green-700' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
