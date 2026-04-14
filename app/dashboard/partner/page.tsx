'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface PartnerData {
  partner: {
    id: string
    name: string
    referral_code: string
    tier: 'affiliate' | 'sales'
    commission_rate: number
    status: string
    landing_headline: string | null
  }
  stats: {
    total_referrals: number
    total_revenue: number
    total_earned: number
    pending_commission: number
    approved_commission: number
    paid_commission: number
  }
  referrals: Array<{
    id: string
    user_name: string
    user_email: string
    created_at: string
    total_spent: number
    total_commission: number
  }>
  commissions: Array<{
    id: string
    product: string
    gross_amount: number
    commission_amount: number
    status: string
    created_at: string
  }>
}

export default function PartnerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<PartnerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
      return
    }

    fetch('/api/partners/me')
      .then(res => {
        if (!res.ok) throw new Error('Not a partner')
        return res.json()
      })
      .then(setData)
      .catch(() => setError('You do not have partner access.'))
      .finally(() => setLoading(false))
  }, [session, status, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A1A2F] to-[#132A47] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8C547]" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A1A2F] to-[#132A47] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">{error || 'Partner account not found.'}</p>
          <Link href="/dashboard" className="text-[#E8C547] hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const { partner, stats, referrals, commissions } = data
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.starworkforcesolutions.com'
  const landingUrl = `${baseUrl}/partner/${partner.referral_code}`
  const signupUrl = `${baseUrl}/auth/signup?ref=${partner.referral_code}`

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fmt = (n: number) => `$${Number(n || 0).toFixed(2)}`
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const productLabels: Record<string, string> = {
    'ATS_OPTIMIZER': 'ATS Resume Optimizer',
    'COVER_LETTER': 'Cover Letter Generator',
    'interview-prep': 'Interview Prep',
    'resume-distribution': 'Resume Distribution',
    'recruiter_basic': 'Recruiter Basic',
    'recruiter_standard': 'Recruiter Standard',
    'recruiter_pro': 'Recruiter Pro',
    'diy_premium': 'DIY Premium',
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    approved: 'bg-blue-500/20 text-blue-400',
    paid: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1A2F] to-[#132A47]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0A1A2F]/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Partner Dashboard</h1>
            <p className="text-sm text-gray-400">
              {partner.name} &middot;{' '}
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                partner.tier === 'sales' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
              }`}>
                {partner.tier === 'sales' ? 'Sales Partner' : 'Affiliate Partner'} &middot; {partner.commission_rate}%
              </span>
            </p>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition">
            Main Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Referral Links */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Your Referral Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Landing Page (recommended)</label>
              <div className="flex gap-2">
                <input readOnly value={landingUrl} className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
                <button onClick={() => copyLink(landingUrl)} className="bg-[#E8C547] text-[#0A1A2F] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#D4AF37] transition whitespace-nowrap">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Direct Signup Link</label>
              <div className="flex gap-2">
                <input readOnly value={signupUrl} className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
                <button onClick={() => copyLink(signupUrl)} className="bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition whitespace-nowrap">
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">Total Referrals</div>
            <div className="text-2xl font-bold text-white">{stats.total_referrals}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">Revenue Generated</div>
            <div className="text-2xl font-bold text-white">{fmt(stats.total_revenue)}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">Total Earned</div>
            <div className="text-2xl font-bold text-[#E8C547]">{fmt(stats.total_earned)}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">Pending Approval</div>
            <div className="text-2xl font-bold text-yellow-400">{fmt(stats.pending_commission)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Referrals Table */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Referred Job Seekers</h2>
            {referrals.length === 0 ? (
              <p className="text-gray-500 text-sm">No referrals yet. Share your link to get started!</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {referrals.map(r => (
                  <div key={r.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div>
                      <div className="text-white text-sm font-medium">{r.user_name || r.user_email}</div>
                      <div className="text-gray-500 text-xs">{fmtDate(r.created_at)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white">{fmt(r.total_spent)} spent</div>
                      <div className="text-xs text-[#E8C547]">{fmt(r.total_commission)} earned</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Commission History */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Commission History</h2>
            {commissions.length === 0 ? (
              <p className="text-gray-500 text-sm">No commissions yet. Referrals who purchase services will appear here.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {commissions.map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div>
                      <div className="text-white text-sm font-medium">{productLabels[c.product] || c.product}</div>
                      <div className="text-gray-500 text-xs">{fmtDate(c.created_at)} &middot; Gross: {fmt(c.gross_amount)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#E8C547]">{fmt(c.commission_amount)}</div>
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColors[c.status] || ''}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
