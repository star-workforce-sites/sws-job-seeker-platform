"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, CheckCircle, FileText, Send, AlertTriangle } from "lucide-react"
import type { CHRMJob } from "@/types/chrm-nexus"

interface ResumeOption {
  id: string
  fileName: string
  uploadedAt: string
}

interface ApplyModalProps {
  job: CHRMJob | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called when application is successfully submitted */
  onSuccess: (jobId: string) => void
}

export default function ApplyModal({ job, open, onOpenChange, onSuccess }: ApplyModalProps) {
  const [resumes, setResumes] = useState<ResumeOption[]>([])
  const [resumesLoading, setResumesLoading] = useState(false)
  const [selectedResumeId, setSelectedResumeId] = useState<string>("none")
  const [coverNote, setCoverNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [routedToEmployer, setRoutedToEmployer] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's stored resumes when modal opens
  useEffect(() => {
    if (!open) return
    setSubmitted(false)
    setError(null)
    setCoverNote("")
    setSelectedResumeId("none")

    setResumesLoading(true)
    fetch("/api/resume/list")
      .then((r) => (r.ok ? r.json() : { resumes: [] }))
      .then((data) => setResumes(data.resumes ?? []))
      .catch(() => setResumes([]))
      .finally(() => setResumesLoading(false))
  }, [open])

  if (!job) return null

  const rateInfo =
    job.rate_min && job.rate_max
      ? `$${job.rate_min.toLocaleString()}–$${job.rate_max.toLocaleString()}/${job.rate_type ?? "hr"}`
      : job.rate_min
        ? `$${job.rate_min.toLocaleString()}+/${job.rate_type ?? "hr"}`
        : null

  const selectedResume = resumes.find((r) => r.id === selectedResumeId)

  async function handleSubmit() {
    // Guard: job must be non-null (TypeScript closure safety)
    if (!job || submitting || submitted) return
    const currentJob = job
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/chrm/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: currentJob.job_id,
          job_title: currentJob.title,
          company: currentJob.company_name ?? null,
          location: `${currentJob.city}, ${currentJob.state}`,
          work_model: currentJob.work_model,
          rate_info: rateInfo,
          employer_email: currentJob.employer_email ?? null,
          resume_id: selectedResumeId !== "none" ? selectedResumeId : null,
          resume_name: selectedResume?.fileName ?? null,
          cover_note: coverNote.trim() || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          // Already applied — treat as success
          setSubmitted(true)
          onSuccess(currentJob.job_id)
        } else if (res.status === 429) {
          setError(data.error ?? "Weekly application limit reached. Upgrade for unlimited applications.")
        } else {
          setError(data.error ?? "Failed to submit application. Please try again.")
        }
        return
      }

      setSubmitted(true)
      setRoutedToEmployer(!!data.routed_to_employer)
      onSuccess(currentJob.job_id)
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg premium-heading leading-tight">
            {submitted ? "Application Submitted" : `Apply: ${job.title}`}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          // ── Success state ──────────────────────────────────
          <div className="py-6 text-center space-y-4">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
            <div>
              <p className="text-base font-semibold text-foreground premium-heading">
                Application submitted!
              </p>
              <p className="text-sm text-muted-foreground premium-body mt-1">
                {routedToEmployer
                  ? "Your application was sent directly to the employer. Expect a reply to your registered email."
                  : "Our team has been notified and will forward your application to the employer."}
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          // ── Apply form ────────────────────────────────────
          <div className="space-y-5 pt-2">
            {/* Job summary strip */}
            <div className="bg-muted/40 rounded-lg px-4 py-3 space-y-1">
              <p className="text-sm font-semibold text-foreground premium-heading truncate">{job.title}</p>
              <p className="text-xs text-muted-foreground premium-body">
                {job.company_name && <span>{job.company_name} · </span>}
                {job.city}, {job.state} · {job.work_model}
                {rateInfo && <span> · {rateInfo}</span>}
              </p>
              {job.employer_email ? (
                <p className="text-[11px] text-green-600 flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3" />
                  Direct apply — your application goes straight to the employer
                </p>
              ) : (
                <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  Our team will forward your application to the employer
                </p>
              )}
            </div>

            {/* Resume picker */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground premium-heading">
                Resume <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              {resumesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading your resumes…
                </div>
              ) : resumes.length > 0 ? (
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <SelectValue placeholder="Select a resume" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No resume (apply without)</SelectItem>
                    {resumes.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.fileName}
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(r.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                  No resumes on file.{" "}
                  <a href="/tools/ats-optimizer" className="text-primary underline underline-offset-2">
                    Upload via ATS Optimizer
                  </a>{" "}
                  to attach one.
                </div>
              )}
            </div>

            {/* Cover note */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground premium-heading">
                Cover note <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                placeholder="Briefly introduce yourself or highlight why you're a great fit (2–3 sentences)"
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                maxLength={500}
                rows={3}
                className="resize-none text-sm premium-body"
              />
              <p className="text-[11px] text-muted-foreground text-right">
                {coverNote.length}/500
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                className="flex-1 bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-bold"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
