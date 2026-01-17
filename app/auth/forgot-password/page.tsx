'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Failed to send reset email');
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A1A2F] to-[#132A47] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>
          <p className="text-gray-300 mb-6">
            We've sent password reset instructions to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <a
            href="/auth/login"
            className="inline-block w-full bg-[#E8C547] text-[#0A1A2F] py-3 rounded-lg font-bold hover:bg-[#D4AF37] transition"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1A2F] to-[#132A47] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
          <p className="text-gray-300">
            Enter your email and we'll send you instructions to reset your password
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#E8C547] focus:ring-1 focus:ring-[#E8C547]"
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E8C547] text-[#0A1A2F] py-3 rounded-lg font-bold hover:bg-[#D4AF37] transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Remember your password?{' '}
          <a href="/auth/login" className="text-[#E8C547] hover:underline font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
