'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Star, LogOut, LayoutDashboard, Home, User } from 'lucide-react'

export default function DashboardHeader() {
  const { data: session } = useSession()

  return (
    <header className="bg-[#0A1A2F] border-b border-white/10 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo + Home */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#E8C547] rounded flex items-center justify-center">
                <Star className="w-5 h-5 text-[#0A1A2F] fill-current" />
              </div>
              <span className="hidden sm:inline text-white font-bold text-sm tracking-wider">
                Career Accel Platform
              </span>
            </Link>
            <Link
              href="/"
              className="text-gray-400 hover:text-[#E8C547] transition-colors text-sm flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-[#E8C547] transition-colors text-sm flex items-center gap-1"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>

          {/* User + Logout */}
          {session?.user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-7 h-7 rounded-full"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#E8C547] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#0A1A2F]" />
                  </div>
                )}
                <span className="text-sm text-white font-medium max-w-[150px] truncate hidden sm:inline">
                  {session.user.name || session.user.email?.split('@')[0] || 'User'}
                </span>
                <span className="text-xs text-gray-400 hidden md:inline">
                  {session.user.role === 'admin' ? '(Admin)' :
                   session.user.role === 'recruiter' ? '(Recruiter)' : ''}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors text-sm px-2 py-1 rounded hover:bg-white/5"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
