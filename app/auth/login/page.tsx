'use client';

import { signIn } from 'next-auth/react';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Separate component that uses useSearchParams - wrapped in Suspense
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const registered = searchParams.get('registered') === 'true'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: 'google' | 'linkedin') => {
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1A2F] to-[#132A47] flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#E8C547] mb-2">
              STAR Workforce
            </h1>
            <p className="text-xl text-white">Welcome Back</p>
            <p className="text-gray-400 mt-2">Sign in to your account</p>
          </div>

          {/* Registration success banner */}
          {registered && !error && (
            <div className="bg-green-500/10 border border-green-500 text-green-400 rounded-lg p-3 mb-6 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Account created! Please sign in to continue.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-6">
              {error}
            </div>
          )}

          {/* OAuth Buttons - PROFESSIONAL STYLE */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-3.5 px-4 rounded-lg font-medium hover:bg-gray-50 transition border border-gray-300 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-semibold">Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthSignIn('linkedin')}
              className="w-full flex items-center justify-center gap-3 bg-[#0077B5] text-white py-3.5 px-4 rounded-lg font-medium hover:bg-[#006399] transition shadow-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-sm font-semibold">Continue with LinkedIn</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0A1A2F] text-gray-400">Or sign in with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#E8C547] focus:ring-1 focus:ring-[#E8C547]"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-[#E8C547] bg-gray-700 border-gray-600 rounded focus:ring-[#E8C547]" />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label>
              <a href="/auth/forgot-password" className="text-sm text-[#E8C547] hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E8C547] text-[#0A1A2F] py-3.5 rounded-lg font-bold hover:bg-[#D4AF37] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <a href="/auth/register" className="text-[#E8C547] hover:underline font-medium">
              Sign up for free
            </a>
          </p>
        </div>
      </div>

      {/* Right side - Features/Marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#E8C547] to-[#D4AF37] items-center justify-center p-12">
        <div className="max-w-md text-[#0A1A2F]">
          <h2 className="text-3xl font-bold mb-6">
            Welcome to STAR Workforce Solutions
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#0A1A2F] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#E8C547]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">ATS Optimizer</h3>
                <p className="text-[#0A1A2F]/80">Beat applicant tracking systems with optimized resumes</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#0A1A2F] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#E8C547]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Cover Letter Generator</h3>
                <p className="text-[#0A1A2F]/80">Create compelling cover letters in seconds</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#0A1A2F] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#E8C547]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Dedicated Recruiters</h3>
                <p className="text-[#0A1A2F]/80">Offshore recruiting team working for you 24/7</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#0A1A2F] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#E8C547]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Resume Distribution</h3>
                <p className="text-[#0A1A2F]/80">Get your resume in front of 1000+ recruiters</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-[#0A1A2F]/10 rounded-lg">
            <p className="text-sm italic">
              "STAR Workforce helped me land my dream job in just 3 weeks!" - Sarah M.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component - wraps LoginForm in Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0A1A2F] to-[#132A47] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
