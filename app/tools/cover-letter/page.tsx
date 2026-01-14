import type { Metadata } from "next"
import CoverLetterClient from "@/components/cover-letter-client"

export const metadata: Metadata = {
  title: "AI Cover Letter Generator - $5 One-Time | STAR Workforce Solutions",
  description:
    "AI-powered cover letter generator. Upload your resume and job description to get a professionally written cover letter. Free preview, $5 one-time payment for full access.",
  keywords: [
    "cover letter generator",
    "AI cover letter",
    "job application",
    "professional cover letter",
    "resume to cover letter",
  ],
  openGraph: {
    title: "AI Cover Letter Generator - $5 One-Time | STAR Workforce Solutions",
    description: "Generate professional cover letters with AI. Free preview, $5 one-time payment.",
    type: "website",
  },
}

export default function CoverLetterPage() {
  return <CoverLetterClient />
}
