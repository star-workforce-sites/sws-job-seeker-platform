'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (session.user?.role !== 'admin') {
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
      <header className="bg-[#0A1A2F] border-b border-[#E8C547]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-[#E8C547]">STAR Workforce - Admin</h1>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/dashboard" className="text-white hover:text-[#E8C547] transition">
                Dashboard
              </a>
              <a href="/admin/users" className="text-white hover:text-[#E8C547] transition">
                Users
              </a>
              <a href="/admin/analytics" className="text-white hover:text-[#E8C547] transition">
                Analytics
              </a>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium">{session?.user?.name}</p>
              <p className="text-gray-400 text-xs">Administrator</p>
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Admin Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Active Subscriptions</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Revenue (MTD)</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">$0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Active Recruiters</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600">Admin panel is being configured.</p>
          <p className="text-gray-500 text-sm mt-2">Full admin features coming soon.</p>
        </div>
      </main>
    </div>
  );
}
