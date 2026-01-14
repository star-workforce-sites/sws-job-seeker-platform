"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function ContactFormClient() {
  const searchParams = useSearchParams()
  const initialSubject = searchParams.get("subject") || ""
  const initialEmail = searchParams.get("email") || ""
  const initialBody = searchParams.get("body") || ""

  const [formData, setFormData] = useState({
    name: "",
    email: initialEmail,
    subject: initialSubject,
    message: initialBody,
  })

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email: initialEmail,
      subject: initialSubject,
      message: initialBody,
    }))
  }, [initialSubject, initialEmail, initialBody])

  const subjects = [
    "General Inquiry",
    "Technical Support",
    "Billing Question",
    "Service Feedback",
    "Bug Report",
    "Feature Request",
    "Complaint",
    "Privacy Concern",
    "Hire Recruiter Inquiry",
    "Resume Distribution Service",
    "ATS Optimization Request",
    "Employer Registration Assistance",
    "Service Upgrade Inquiry",
    "Partnership Opportunity",
    "Other",
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        alert("Thank you for contacting us! We will respond within 24 hours to info@starworkforcesolutions.com")
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else {
        alert("Error sending message. Please try again.")
      }
    } catch (error) {
      console.error("Contact form error:", error)
      alert("Error sending message. Please try again.")
    }
  }

  return (
    <>
      {/* Contact Form */}
      <Card className="p-8 border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-6 premium-heading">Send us a Message</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 premium-heading">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary premium-body"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 premium-heading">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary premium-body"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 premium-heading">
              Subject * <span className="text-xs text-muted-foreground">(auto-filled from where you clicked)</span>
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary premium-body"
            >
              <option value="">Select a subject...</option>
              {subjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 premium-heading">Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary premium-body"
              placeholder="Your message here..."
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 h-auto premium-heading"
          >
            Send Message
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted/50 border border-border rounded text-xs text-muted-foreground premium-body">
          <p>
            <strong>Note:</strong> Responses from STAR Workforce Solutions are provided on a best-effort basis. We may
            use AI tools to assist with responses. Users are responsible for verifying all information.
          </p>
        </div>
      </Card>

      {/* Complaint Resolution Info */}
      <Card className="p-6 border border-border mt-8 bg-muted">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-foreground mb-2 premium-heading">Complaint Resolution Process</h3>
            <p className="text-sm text-muted-foreground mb-3 premium-body">
              We take all complaints seriously. Our standard resolution timeline is:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 premium-body">
              <li>• Initial review: 48 hours</li>
              <li>• Internal resolution attempt: 30 days</li>
              <li>• Escalation to management: 60 days</li>
              <li>• Regulatory reporting if applicable</li>
            </ul>
          </div>
        </div>
      </Card>
    </>
  )
}
