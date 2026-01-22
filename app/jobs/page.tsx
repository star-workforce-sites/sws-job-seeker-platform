"use client"

import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { MapPin, DollarSign, Briefcase, BookmarkIcon } from "lucide-react"

type Job = {
  id: string
  title: string
  company: string
  location: string
  employmentType: string
  salary: string
  description: string
  postedDate: string
  remoteType: string
}

export default function Jobs() {
  const { data: session } = useSession()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    remote: "all",
    salary: "all",
    level: "all",
  })
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [applicationsToday, setApplicationsToday] = useState(0)

  const MAX_FREE_APPLICATIONS = 5

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("/api/jobs/list")
        const data = await response.json()
        setJobs(data.jobs || [])
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  useEffect(() => {
    async function fetchUserData() {
      if (!session?.user?.id) return

      try {
        const [statsRes, savedRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/dashboard/saved-jobs"),
        ])

        if (statsRes.ok) {
          const stats = await statsRes.json()
          setApplicationsToday(stats.applicationsToday || 0)
        }

        if (savedRes.ok) {
          const saved = await savedRes.json()
          setSavedJobs(saved.savedJobs?.map((j: any) => j.jobId) || [])
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
      }
    }

    fetchUserData()
  }, [session])

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (filters.remote !== "all" && job.remoteType !== filters.remote) return false

    return true
  })

  const handleSaveJob = useCallback(
    async (jobId: string) => {
      if (!session?.user?.id) {
        router.push("/auth/login?callbackUrl=/jobs")
        return
      }

      try {
        const method = savedJobs.includes(jobId) ? "DELETE" : "POST"
        const response = await fetch("/api/jobs/save", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        })

        if (response.ok) {
          setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
        }
      } catch (error) {
        console.error("Failed to save job:", error)
      }
    },
    [savedJobs, session, router],
  )

  const handleApply = useCallback(
    async (jobId: string) => {
      if (!session?.user?.id) {
        router.push("/auth/login?callbackUrl=/jobs")
        return
      }

      if (applicationsToday >= MAX_FREE_APPLICATIONS) {
        alert("You have reached your daily application limit (5). Upgrade to Premium for unlimited applications.")
        return
      }

      try {
        const response = await fetch("/api/jobs/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        })

        if (response.ok) {
          setApplicationsToday((prev) => prev + 1)
          alert("Application submitted! Check your dashboard for status updates.")
        } else {
          const error = await response.json()
          alert(error.error || "Failed to submit application")
        }
      } catch (error) {
        console.error("Failed to apply:", error)
        alert("Failed to submit application. Please try again.")
      }
    },
    [applicationsToday, session, router],
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="abstract-gradient text-primary-foreground py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white premium-heading">
            Consulting & Contract Jobs
          </h1>
          <p className="text-lg text-white/90 premium-body">
            Browse thousands of premium opportunities in Software, AI, Cloud, and more
          </p>
        </div>
      </section>

      {/* Main Content - FIXED: Added padding-top */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <Input
            type="text"
            placeholder="Search by job title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Work Type</label>
              <select
                value={filters.remote}
                onChange={(e) => setFilters({ ...filters, remote: e.target.value })}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="all">All</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Job Type</label>
              <select
                value={filters.salary}
                onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="all">All</option>
                <option value="contract">Contract</option>
                <option value="consulting">Consulting</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-muted-foreground">
                Applications: {applicationsToday}/{MAX_FREE_APPLICATIONS}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            {filteredJobs.length} jobs found
          </p>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2 premium-heading">
                      {job.title}
                    </h3>
                    <p className="text-muted-foreground premium-body">{job.company}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSaveJob(job.id)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <BookmarkIcon
                      className={`h-5 w-5 ${savedJobs.includes(job.id) ? "fill-current text-primary" : ""}`}
                    />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="capitalize">{job.employmentType}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{job.salary}</span>
                  </div>
                  <div>
                    <span className="capitalize">{job.remoteType}</span>
                  </div>
                  <div>
                    <span>Posted {job.postedDate}</span>
                  </div>
                </div>

                <p className="text-foreground mb-4 line-clamp-3 premium-body">
                  {job.description}
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApply(job.id)}
                    disabled={session && applicationsToday >= MAX_FREE_APPLICATIONS}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                  >
                    {!session ? "Login to Apply" : "Apply Now"}
                  </Button>
                  <Button variant="outline">View Details</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
