import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sql } from "@vercel/postgres"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Mail, Briefcase, Upload, TrendingUp, Users, Clock } from "lucide-react"

export default async function JobSeekerDashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/auth/login")
  }

  // Get user data
  const userResult = await sql`
    SELECT id, name, email, role 
    FROM users 
    WHERE email = ${session.user.email}
  `

  if (userResult.rows.length === 0 || userResult.rows[0].role !== "jobseeker") {
    redirect("/auth/login")
  }

  const user = userResult.rows[0]

  // Get subscription status
  let subscription = null
  let hasRecruiterSubscription = false
  
  try {
    const subResult = await sql`
      SELECT 
        subscription_type,
        status,
        current_period_end
      FROM subscriptions
      WHERE user_id = ${user.id}
        AND status = 'active'
        AND subscription_type LIKE 'recruiter_%'
      ORDER BY created_at DESC
      LIMIT 1
    `
    
    if (subResult.rows.length > 0) {
      subscription = subResult.rows[0]
      hasRecruiterSubscription = true
    }
  } catch (error) {
    console.error("Error fetching subscription:", error)
  }

  // Get application count
  let applicationCount = 0
  try {
    const appResult = await sql`
      SELECT COUNT(*) as count
      FROM applications
      WHERE "userId" = ${user.id}
    `
    applicationCount = parseInt(appResult.rows[0]?.count || "0")
  } catch (error) {
    console.error("Error fetching applications:", error)
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground premium-heading">
            Welcome back, {user.name || "Job Seeker"}!
          </h1>
          <p className="text-muted-foreground mt-2 premium-body">
            Your job search dashboard
          </p>
        </div>

        {/* Current Plan Card */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-[#0A1A2F] to-[#132A47] text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold premium-heading">Current Plan</h3>
              {hasRecruiterSubscription ? (
                <>
                  <p className="text-2xl font-bold text-[#E8C547] mt-2 premium-heading">
                    {subscription?.subscription_type === 'recruiter_basic' && 'Recruiter Basic'}
                    {subscription?.subscription_type === 'recruiter_standard' && 'Recruiter Standard'}
                    {subscription?.subscription_type === 'recruiter_pro' && 'Recruiter Pro'}
                  </p>
                  <p className="text-sm text-gray-300 mt-1 premium-body">
                    Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-gray-400 mt-2 premium-heading">Free</p>
              )}
            </div>
            {!hasRecruiterSubscription && (
              <Link href="/hire-recruiter">
                <Button className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] premium-heading">
                  Upgrade Plan
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Hire Recruiter Card - Show if no subscription */}
        {!hasRecruiterSubscription && (
          <Card className="mb-8 p-8 bg-gradient-to-r from-[#E8C547]/20 to-[#FFD700]/10 border-2 border-[#E8C547]">
            <div className="flex items-start gap-4">
              <Users className="w-12 h-12 text-[#E8C547] flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2 text-foreground premium-heading">
                  Want a Dedicated Recruiter?
                </h3>
                <p className="text-muted-foreground mb-4 premium-body">
                  Let our offshore recruiters handle your job search. Choose the plan that fits your needs.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white/50 p-4 rounded-lg">
                    <h4 className="text-lg font-bold text-[#0A1A2F] mb-1 premium-heading">Basic</h4>
                    <p className="text-2xl font-bold text-[#E8C547] premium-heading">$199/mo</p>
                    <p className="text-sm text-muted-foreground premium-body">3-5 apps/day</p>
                  </div>
                  <div className="bg-white/70 p-4 rounded-lg border-2 border-[#E8C547]">
                    <div className="text-xs font-bold text-[#E8C547] mb-1 premium-body">MOST POPULAR</div>
                    <h4 className="text-lg font-bold text-[#0A1A2F] mb-1 premium-heading">Standard</h4>
                    <p className="text-2xl font-bold text-[#E8C547] premium-heading">$399/mo</p>
                    <p className="text-sm text-muted-foreground premium-body">10-15 apps/day</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg">
                    <h4 className="text-lg font-bold text-[#0A1A2F] mb-1 premium-heading">Pro</h4>
                    <p className="text-2xl font-bold text-[#E8C547] premium-heading">$599/mo</p>
                    <p className="text-sm text-muted-foreground premium-body">20-30 apps/day</p>
                  </div>
                </div>
                <Link href="/hire-recruiter">
                  <Button size="lg" className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] premium-heading">
                    View All Plans
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Recruiter Status Card - Show if has subscription */}
        {hasRecruiterSubscription && (
          <Card className="mb-8 p-6 border-2 border-[#E8C547]">
            <div className="flex items-center gap-4">
              <Users className="w-10 h-10 text-[#E8C547]" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground premium-heading">Your Recruiter</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <p className="text-muted-foreground premium-body">
                    <span className="font-semibold text-orange-500">Pending Assignment</span> - 
                    Your recruiter will be assigned within 48 hours
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-2 premium-body">
                  You'll receive an email introduction once your recruiter is assigned
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Briefcase className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground premium-body">Applications</p>
                <p className="text-2xl font-bold text-foreground premium-heading">{applicationCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground premium-body">Interview Stage</p>
                <p className="text-2xl font-bold text-foreground premium-heading">0</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Mail className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground premium-body">Responses</p>
                <p className="text-2xl font-bold text-foreground premium-heading">0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/tools/ats-optimizer">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <FileText className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2 premium-heading">ATS Optimizer</h3>
              <p className="text-sm text-muted-foreground premium-body">
                Optimize your resume for ATS systems
              </p>
            </Card>
          </Link>

          <Link href="/tools/cover-letter">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <Upload className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2 premium-heading">Cover Letter</h3>
              <p className="text-sm text-muted-foreground premium-body">
                Generate AI-powered cover letters
              </p>
            </Card>
          </Link>

          <Link href="/jobs">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <Briefcase className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2 premium-heading">Browse Jobs</h3>
              <p className="text-sm text-muted-foreground premium-body">
                Search and apply to consulting roles
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
