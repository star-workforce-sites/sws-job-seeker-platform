'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Menu, X, Star, User, LogOut, LayoutDashboard } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session, status } = useSession()

  const navLinks = [
    { href: '/services', label: 'Services' },
    { href: '/tools/ats-optimizer', label: 'ATS Optimizer' },
    { href: '/distribution-wizard', label: 'Distribution Wizard' },
    { href: '/jobs', label: 'Job Search' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/contact', label: 'Contact' },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-[#0A1A2F] border-b border-white/10 sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E8C547] rounded flex items-center justify-center shadow-md hover:shadow-lg transition-all">
              <Star className="w-6 h-6 text-[#0A1A2F] fill-current" />
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-sm tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
                STAR
              </div>
              <div className="text-[#E8C547] text-xs font-bold uppercase" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '0.05em' }}>
                Workforce Solutions
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-sm font-medium text-gray-300 hover:text-[#E8C547] transition-colors duration-200"
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 500 }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
            ) : session ? (
              /* Logged In State */
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button 
                    variant="ghost" 
                    className="text-gray-300 hover:text-[#E8C547] hover:bg-transparent font-medium transition-colors flex items-center gap-2"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-[#E8C547] flex items-center justify-center">
                    {session.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || 'User'} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="w-4 h-4 text-[#0A1A2F]" />
                    )}
                  </div>
                  <span className="text-sm text-white font-medium max-w-[120px] truncate">
                    {session.user?.name || session.user?.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-red-400 hover:bg-transparent font-medium transition-colors"
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              /* Logged Out State */
              <>
                <Link href="/auth/login">
                  <Button 
                    variant="ghost" 
                    className="text-gray-300 hover:text-[#E8C547] hover:bg-transparent font-medium transition-colors"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button 
                    className="bg-[#0A1A2F] hover:bg-[#132A47] text-[#E8C547] font-semibold border border-[#E8C547]"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-white/10 rounded transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-[#E8C547] hover:bg-white/5 px-4 py-2 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="border-t border-white/10 my-2"></div>
              
              {session ? (
                /* Mobile Logged In State */
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-10 h-10 rounded-full bg-[#E8C547] flex items-center justify-center">
                      {session.user?.image ? (
                        <img 
                          src={session.user.image} 
                          alt={session.user.name || 'User'} 
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <User className="w-5 h-5 text-[#0A1A2F]" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {session.user?.name || 'User'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="text-gray-300 hover:text-[#E8C547] hover:bg-white/5 px-4 py-2 rounded transition-colors flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      handleSignOut()
                    }}
                    className="text-red-400 hover:bg-white/5 px-4 py-2 rounded transition-colors text-left flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                /* Mobile Logged Out State */
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-300 hover:text-[#E8C547] hover:bg-white/5 px-4 py-2 rounded transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-[#E8C547] text-[#0A1A2F] font-semibold px-4 py-2 rounded mx-4 text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
