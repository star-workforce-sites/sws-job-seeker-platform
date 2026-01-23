'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { LoadingPage } from '@/components/loading';
import { ApplyButton } from '@/components/apply-button';
import { useToast } from '@/components/toast-provider';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salary_min: number;
  salary_max: number;
  posted_at: string;
  expires_at: string;
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobId, setJobId] = useState<string>('');
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      setJobId(id);
      fetchJob(id);
      if (session?.user) {
        checkIfApplied(id);
      }
    });
  }, [params, session]);

  const fetchJob = async (id: string) => {
    try {
      const response = await fetch(`/api/jobs/${id}`);
      if (!response.ok) {
        throw new Error('Job not found');
      }
      const data = await response.json();
      setJob(data.job);
    } catch (error) {
      console.error('Error fetching job:', error);
      showToast('Failed to load job details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async (id: string) => {
    try {
      const response = await fetch(`/api/jobs/apply?jobId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setHasApplied(data.applied || false);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  if (loading) {
    return <LoadingPage text="Loading job details..." />;
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
            <button
              onClick={() => router.push('/jobs')}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Back to Jobs
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Back Button */}
        <button
          onClick={() => router.push('/jobs')}
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </button>

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
                {job.type}
              </span>
            </div>
          </div>

          <div className="p-8">
            {/* Salary */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Compensation</h2>
              <p className="text-3xl font-bold text-green-600">
                ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                <span className="text-lg text-gray-600 font-normal"> per year</span>
              </p>
            </div>

            {/* Apply Button */}
            <div className="mb-8">
              <ApplyButton jobId={jobId} hasApplied={hasApplied} />
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsibilities</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {job.responsibilities.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {job.requirements.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {job.benefits.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Posted Date */}
            <div className="text-sm text-gray-500 border-t pt-4">
              Posted: {new Date(job.posted_at).toLocaleDateString('en-US', {
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
