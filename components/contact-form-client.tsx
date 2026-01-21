'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSearchParams } from 'next/navigation'

const SUBJECT_OPTIONS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'ats-optimizer', label: 'ATS Optimizer' },
  { value: 'cover-letter', label: 'Cover Letter Generator' },
  { value: 'resume-distribution', label: 'Resume Distribution Service' },
  { value: 'hire-recruiter-basic', label: 'Hire Recruiter - Basic Plan' },
  { value: 'hire-recruiter-standard', label: 'Hire Recruiter - Standard Plan' },
  { value: 'hire-recruiter-pro', label: 'Hire Recruiter - Pro Plan' },
  { value: 'interview-prep', label: 'Interview Preparation' },
  { value: 'job-search', label: 'Job Search Assistance' },
  { value: 'employer-services', label: 'Employer/Recruiting Services' },
  { value: 'billing', label: 'Billing & Payments' },
  { value: 'technical-support', label: 'Technical Support' },
  { value: 'partnership', label: 'Partnership Opportunities' },
  { value: 'feedback', label: 'Feedback & Suggestions' },
]

export default function ContactFormClient() {
  const searchParams = useSearchParams()
  const initialSubject = searchParams.get('subject') || 'general'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: initialSubject,
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setFormData({ name: '', email: '', subject: 'general', message: '' })
      } else {
        setError(data.message || 'Failed to send message. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please email info@starworkforcesolutions.com directly.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Message Sent!</h3>
        <p className="text-muted-foreground mb-4">
          Thank you for reaching out. We'll respond within 24 hours.
        </p>
        <Button onClick={() => setSuccess(false)} variant="outline">
          Send Another Message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Your Name *
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email Address *
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            required
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
          Subject *
        </label>
        <Select
          value={formData.subject}
          onValueChange={(value) => setFormData({ ...formData, subject: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {SUBJECT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
          Message *
        </label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="How can we help you?"
          rows={5}
          required
          className="w-full"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-semibold py-3"
      >
        {loading ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  )
}
