"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, HelpCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react"

const SUPPORT_SUBJECTS = [
  { value: "billing",           label: "Billing & Payments" },
  { value: "recruiter",         label: "Recruiter / Plan Question" },
  { value: "technical-support", label: "Technical Support" },
  { value: "job-search",        label: "Job Search Help" },
  { value: "feedback",          label: "Feedback & Suggestions" },
  { value: "general",           label: "General Inquiry" },
]

export default function DashboardSupportCard({
  userEmail,
  userName,
}: {
  userEmail: string
  userName: string
}) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState("billing")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [honeypot, setHoneypot] = useState("")
  const [formLoadTime] = useState(() => Date.now())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          subject,
          message: message.trim(),
          submittedAt: new Date().toISOString(),
          _hp: honeypot,
          _elapsed: Date.now() - formLoadTime,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
        setMessage("")
      } else {
        setError(data.message || "Failed to send. Please try again.")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-5">
      {/* Header row — always visible */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#E8C547]" />
          <span className="font-bold text-foreground premium-heading text-sm">
            Support &amp; Contact
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="mt-4">
          {sent ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <p className="font-semibold text-foreground premium-heading">Message sent!</p>
              <p className="text-sm text-muted-foreground premium-body">
                Our team will respond to <strong>{userEmail}</strong> within 24 hours.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => setSent(false)}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot — hidden */}
              <div style={{ display: "none" }} aria-hidden="true">
                <input
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="text-xs text-muted-foreground premium-body">
                Sending as <strong>{userName || userEmail}</strong> ({userEmail})
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Topic
                </label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORT_SUBJECTS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  rows={4}
                  required
                  className="resize-none text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !message.trim()}
                className="w-full bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sending…
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          )}
        </div>
      )}
    </Card>
  )
}
