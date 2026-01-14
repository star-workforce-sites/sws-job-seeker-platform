"use client"

import { useState, useCallback, useEffect } from "react"
// import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { MapPin, DollarSign, Briefcase, BookmarkIcon } from "lucide-react"

// Mock job data
type Job = {
  id: number
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
  // const { data: session } = useSession()
  const session = null // Temporary: no authentication

  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    remote: "all",
    salary: "all",
    level: "all",
  })
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [savedJobs, setSavedJobs] = useState<number[]>([])
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
      // if (!session?.user?.id) return

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
    async (jobId: number) => {
      // if (!session?.user?.id) {
      //   alert("Please log in to save jobs")
      //   return
      // }

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
    [savedJobs, session],
  )

  const handleApply = useCallback(
    async (jobId: number) => {
      // if (!session?.user?.id) {
      //   alert("Please log in to apply for jobs")
      //   return
      // }

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
        alert("Failed to submit application")
      }
    },
    [applicationsToday, session],
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <section className="abstract-gradient text-primary-foreground py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white premium-heading">
            Consulting & Contract Jobs
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto premium-body">
            Browse thousands of premium opportunities in Software, AI, Cloud, and more
          </p>
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-8 px-4 sm:px-6 lg:px-8 sticky top-16 z-40 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Work Type</label>
                <select
                  value={filters.remote}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, remote: e.target.value }))
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="all">All</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Job Type</label>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters((prev) => ({ ...prev, level: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="all">All</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid-Level</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Applications</label>
                <div className="px-3 py-2 border border-border rounded-md bg-background text-foreground">
                  {applicationsToday}/{MAX_FREE_APPLICATIONS}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <p className="text-muted-foreground mb-6">
            {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
          </p>

          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="p-6 border border-border hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">{job.title}</h3>
                    <p className="text-primary font-medium mb-3">{job.company}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.employmentType}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </div>
                    </div>

                    <p className="text-foreground mb-3 line-clamp-2">{job.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Posted {new Date(job.postedDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 md:ml-4">
                    <Button
                      onClick={() => handleApply(job.id)}
                      disabled={applicationsToday >= MAX_FREE_APPLICATIONS || !session}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                    >
                      {!session ? "Login to Apply" : "Apply Now"}
                    </Button>
                    <Button
                      onClick={() => handleSaveJob(job.id)}
                      variant="outline"
                      disabled={!session}
                      className={`${savedJobs.includes(job.id) ? "bg-secondary text-secondary-foreground" : ""}`}
                    >
                      <BookmarkIcon className="w-4 h-4 mr-2" />
                      {savedJobs.includes(job.id) ? "Saved" : "Save"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No jobs found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
