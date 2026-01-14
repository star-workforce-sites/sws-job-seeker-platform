"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Heart, BarChart3, Zap, Activity, TrendingUp } from "lucide-react"

type DashboardStats = {
  totalApplications: number
  savedJobs: number
  interviews: number
  applicationsToday: number
  isPremium: boolean
}

type Application = {
  id: number
  status: string
  appliedAt: string
  title: string
  company: string
  location: string
}

export default function Dashboard() {
  const session = null
  const status = "unauthenticated"

  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, appsRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/dashboard/applications"),
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (appsRes.ok) {
          const appsData = await appsRes.json()
          setApplications(appsData.applications || [])
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Updated header to use inline styles instead of abstract-gradient class */}
      <div
        className="text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.70) 50%, rgba(0, 0, 0, 0.30) 100%), url(/images/professional-deep-blue-and-gold-abstract-corporate-background-with-subtle-network-connections-920ce753.png)",
          backgroundSize: "auto, cover",
          backgroundPosition: "center, center",
          backgroundAttachment: "scroll, fixed",
        }}
      >
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold premium-heading mb-3">Your Dashboard</h1>
          <p className="text-lg text-white/90 premium-body">
            Manage your consulting & contract job search and track your progress
          </p>
        </div>
      </div>

      {/* Stats */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-2xl font-bold text-foreground">{stats?.totalApplications || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saved Jobs</p>
                <p className="text-2xl font-bold text-foreground">{stats?.savedJobs || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interviews</p>
                <p className="text-2xl font-bold text-foreground">{stats?.interviews || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subscription</p>
                <p className="text-2xl font-bold text-foreground">{stats?.isPremium ? "Premium" : "Free"}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md bg-muted">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <Card className="p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Real-Time Activity</h2>
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-4">
                  {[
                    { time: "Today 2:30 PM", action: "Recruiter viewed your profile", type: "success" },
                    { time: "Today 1:15 PM", action: "Applied to Senior Engineer at TechCorp", type: "success" },
                    { time: "Yesterday", action: "Completed ATS Optimization", type: "success" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.action}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 border border-border bg-primary/5">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">View Analytics</h2>
                  </div>
                  <p className="text-foreground mb-4">
                    Track your application progress, response rates, and interview metrics in real-time.
                  </p>
                  <Link href="/dashboard/analytics">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Open Analytics Dashboard
                    </Button>
                  </Link>
                </Card>

                <Card className="p-6 border border-border bg-accent/5">
                  <h2 className="text-xl font-bold text-foreground mb-4">Upgrade Your Account</h2>
                  <p className="text-foreground mb-4">
                    Unlock unlimited applications, AI tools, and recruiter services.
                  </p>
                  <Link href="/pricing">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">View Plans</Button>
                  </Link>
                </Card>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <Card className="p-6 border border-border">
                <h2 className="text-xl font-bold text-foreground mb-6">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                    <div className="px-4 py-2 bg-muted rounded border border-border text-foreground">John Doe</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <div className="px-4 py-2 bg-muted rounded border border-border text-foreground">
                      john@example.com
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Resume</label>
                    <div className="px-4 py-3 bg-muted rounded border-2 border-dashed border-border text-foreground">
                      <p className="mb-2">Drag and drop your resume here or click to upload</p>
                      <Button variant="outline" className="border-primary text-primary bg-transparent">
                        Upload Resume
                      </Button>
                    </div>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4">Save Changes</Button>
                </div>
              </Card>
            </TabsContent>

            {/* Applications Tab */}
            <TabsContent value="applications" className="mt-6">
              <Card className="p-6 border border-border">
                <h2 className="text-xl font-bold text-foreground mb-6">Your Applications</h2>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="flex justify-between items-center pb-4 border-b border-border last:border-0"
                      >
                        <div>
                          <p className="font-medium text-foreground">{app.title}</p>
                          <p className="text-sm text-muted-foreground">{app.company}</p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-medium ${
                              app.status === "applied"
                                ? "text-primary"
                                : app.status === "interview"
                                  ? "text-green-600"
                                  : "text-red-600"
                            }`}
                          >
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No applications yet. Start applying to jobs!</p>
                )}
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="mt-6">
              <Card className="p-6 border border-border">
                <h2 className="text-xl font-bold text-foreground mb-6">Billing & Subscriptions</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-muted rounded border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
                    <p className="text-lg font-bold text-foreground">Free</p>
                    <Link href="/pricing">
                      <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                        Upgrade Plan
                      </Button>
                    </Link>
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground mb-3">Billing History</h3>
                    <p className="text-muted-foreground">No billing history yet.</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  )
}
