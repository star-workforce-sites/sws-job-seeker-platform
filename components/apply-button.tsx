'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from './toast-provider';

interface ApplyButtonProps {
  jobId: string;
  hasApplied?: boolean;
}

export function ApplyButton({ jobId, hasApplied = false }: ApplyButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(hasApplied);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Wait for session to fully load before allowing actions
  useEffect(() => {
    if (status !== 'loading') {
      setSessionChecked(true);
      console.log('[ApplyButton] Session loaded:', { 
        status, 
        hasEmail: !!session?.user?.email,
        userEmail: session?.user?.email 
      });
    }
  }, [status, session]);

  const handleApply = async () => {
    console.log('[ApplyButton] handleApply called', { 
      status, 
      sessionChecked,
      hasSession: !!session,
      hasEmail: !!session?.user?.email 
    });
    
    // CRITICAL: Wait for session to finish loading
    if (status === 'loading' || !sessionChecked) {
      console.log('[ApplyButton] Session still loading, waiting...');
      showToast('Loading session...', 'info');
      return;
    }

    // Check authentication AFTER session loads
    if (status === 'unauthenticated' || !session?.user?.email) {
      console.log('[ApplyButton] User not authenticated, redirecting to login');
      showToast('Please sign in to apply for jobs', 'warning');
      // Use full URL path for callback
      const callbackUrl = encodeURIComponent(`/jobs/${jobId}`);
      router.push(`/auth/login?callbackUrl=${callbackUrl}`);
      return;
    }

    console.log('[ApplyButton] User authenticated, submitting application');
    setApplying(true);

    try {
      const response = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('[ApplyButton] Application submitted successfully');
        showToast('Application submitted successfully!', 'success');
        setApplied(true);
      } else if (response.status === 409) {
        console.log('[ApplyButton] Already applied');
        showToast('You have already applied to this job', 'info');
        setApplied(true);
      } else if (response.status === 401) {
        console.log('[ApplyButton] Unauthorized - session expired?');
        showToast('Your session has expired. Please sign in again.', 'error');
        const callbackUrl = encodeURIComponent(`/jobs/${jobId}`);
        router.push(`/auth/login?callbackUrl=${callbackUrl}`);
      } else {
        console.log('[ApplyButton] Application failed:', data.error);
        showToast(data.error || 'Failed to submit application', 'error');
      }
    } catch (error) {
      console.error('[ApplyButton] Network error:', error);
      showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
      setApplying(false);
    }
  };

  // Show applied state
  if (applied) {
    return (
      <button
        disabled
        className="w-full bg-green-100 text-green-700 py-3 px-6 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Applied
      </button>
    );
  }

  // Show loading state while session loads
  if (status === 'loading' || !sessionChecked) {
    return (
      <button
        disabled
        className="w-full bg-gray-200 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </button>
    );
  }

  // Show apply button (logged in or logged out)
  return (
    <button
      onClick={handleApply}
      disabled={applying}
      className={`w-full py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
        applying
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
    >
      {applying ? (
        <>
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Applying...
        </>
      ) : status === 'unauthenticated' ? (
        'Login to Apply'
      ) : (
        'Apply Now'
      )}
    </button>
  );
}
