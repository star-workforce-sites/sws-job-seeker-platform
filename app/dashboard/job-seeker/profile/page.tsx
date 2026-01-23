'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { LoadingPage } from '@/components/loading';
import { useToast } from '@/components/toast-provider';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard/job-seeker/profile');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <LoadingPage text="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="space-y-6">
            {/* Profile Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{session?.user?.name || 'Not provided'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{session?.user?.email}</p>
                </div>
              </div>
            </div>

            {/* Coming Soon Features */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Features</h2>
              <p className="text-gray-600 mb-4">
                Profile editing features are coming soon. You'll be able to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Update your personal information</li>
                <li>Upload your resume</li>
                <li>Add skills and experience</li>
                <li>Set job preferences</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="border-t pt-6">
              <button
                onClick={() => router.push('/dashboard/job-seeker')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
