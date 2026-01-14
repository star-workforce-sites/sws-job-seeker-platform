"use client"

import { useEffect, useState } from "react"
// import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"

interface Job {
  id: string
  title: string
  description: string
  location: string
  industry: string
  employmentType: string
  visa: string | null
  salaryMin: number | null
  salaryMax: number | null
  expiresAt: string
  createdAt: string
  isActive: boolean
}

export default function EmployerDashboardPage() {
  const status = "authenticated"
  const session = { user: { role: "employer" as const } }

  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  // useEffect(() => {
  //   if (status === "unauthenticated") {
  //     router.push("/auth/login")
  //   } else if (status === "authenticated" && session?.user?.role !== "employer") {
  //     router.push("/dashboard")
  //   }
  // }, [status, router])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "employer") {
      fetchJobs()
    }
  }, [status])

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs/employer/list")
      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error("[v0] Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async (jobId: string) => {
    if (!confirm("Are you sure you want to deactivate this job?")) return

    try {
      const response = await fetch(`/api/jobs/${jobId}/deactivate`, {
        method: "POST",
      })

      if (response.ok) {
        fetchJobs()
      }
    } catch (error) {
      console.error("[v0] Error deactivating job:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8C547] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const activeJobs = jobs.filter((j) => j.isActive)
  const inactiveJobs = jobs.filter((j) => !j.isActive)

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div
        className="relative min-h-[30vh] flex items-center justify-center py-16"
        style={{
          backgroundImage: `linear-gradient(to bottom right, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3)), url('/images/professional-deep-blue-and-gold-abstract-corporate-background-with-subtle-network-connections-920ce753.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">Employer Dashboard</h1>
          <p className="text-xl text-gray-200">Manage your job postings ({activeJobs.length}/5 active)</p>
        </div>
      </div>

      <div className="flex-grow bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-heading font-bold text-[#0A1A2F]">Your Job Postings</h2>
              <p className="text-gray-600">Maximum 5 active jobs, auto-expire after 30 days</p>
            </div>
            <Link href="/employer/jobs/create">
              <Button disabled={activeJobs.length >= 5} className="bg-[#E8C547] hover:bg-[#d4b540] text-[#0A1A2F]">
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            </Link>
          </div>

          {activeJobs.length >= 5 && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                You've reached the maximum of 5 active jobs. Deactivate a job to post a new one.
              </p>
            </div>
          )}

          {/* Active Jobs */}
          <div className="mb-12">
            <h3 className="text-xl font-heading font-semibold text-[#0A1A2F] mb-4">
              Active Jobs ({activeJobs.length})
            </h3>
            <div className="grid gap-6">
              {activeJobs.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    No active jobs. Post your first job to get started.
                  </CardContent>
                </Card>
              ) : (
                activeJobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-heading text-xl">{job.title}</CardTitle>
                          <CardDescription>
                            <div className="flex items-center gap-2 mt-2">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                          </CardDescription>
                        </div>
                        <Badge variant="default" className="bg-green-500">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{job.industry}</Badge>
                        <Badge variant="outline">{job.employmentType}</Badge>
                        {job.visa && <Badge variant="outline">Visa: {job.visa}</Badge>}
                      </div>
                      {(job.salaryMin || job.salaryMax) && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          {job.salaryMin && job.salaryMax
                            ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
                            : job.salaryMin
                              ? `From $${job.salaryMin.toLocaleString()}`
                              : `Up to $${job.salaryMax?.toLocaleString()}`}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        Expires: {new Date(job.expiresAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDeactivate(job.id)}>
                          Deactivate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Inactive Jobs */}
          {inactiveJobs.length > 0 && (
            <div>
              <h3 className="text-xl font-heading font-semibold text-[#0A1A2F] mb-4">
                Inactive Jobs ({inactiveJobs.length})
              </h3>
              <div className="grid gap-6">
                {inactiveJobs.map((job) => (
                  <Card key={job.id} className="opacity-60">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-heading text-xl">{job.title}</CardTitle>
                          <CardDescription>
                            <div className="flex items-center gap-2 mt-2">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">Inactive</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">Expired: {new Date(job.expiresAt).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
