'use client';

import { useState } from 'react';
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

  const handleApply = async () => {
    if (status === 'unauthenticated') {
      showToast('Please sign in to apply for jobs', 'warning');
      router.push(`/auth/login?callbackUrl=/jobs/${jobId}`);
      return;
    }

    setApplying(true);
    
    try {
      const response = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Application submitted successfully!', 'success');
        setApplied(true);
      } else if (response.status === 409) {
        showToast('You have already applied to this job', 'info');
        setApplied(true);
      } else {
        showToast(data.error || 'Failed to submit application', 'error');
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setApplying(false);
    }
  };

  if (applied) {
    return (
      <button
        disabled
        className="w-full bg-green-100 text-green-700 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
      >
        ✓ Applied
      </button>
    );
  }

  return (
    <button
      onClick={handleApply}
      disabled={applying}
      className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
        applying
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
    >
      {applying ? 'Applying...' : 'Apply Now'}
    </button>
  );
}
