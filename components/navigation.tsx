'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, Star } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: '/services', label: 'Services' },
    { href: '/tools/ats-optimizer', label: 'ATS Optimizer' },
    { href: '/distribution-wizard', label: 'Distribution Wizard' },
    { href: '/jobs', label: 'Job Search' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav className="bg-[#0A1A2F] border-b border-white/10 sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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

          <div className="hidden md:flex items-center gap-3">
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
          </div>

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

        {isOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-gray-300 hover:text-[#E8C547] hover:bg-white/5 rounded font-medium text-sm transition-colors"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="space-y-2 px-4 pt-4 border-t border-white/10 mt-4">
              <Link href="/auth/login" className="block" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full text-white border-white/30 hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup" className="block" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-[#E8C547] text-[#0A1A2F] hover:bg-[#D4AF37] font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
 
  )
}
