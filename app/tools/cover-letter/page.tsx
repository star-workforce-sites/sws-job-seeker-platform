import type { Metadata } from "next"
import CoverLetterClient from "@/components/cover-letter-client"

export const metadata: Metadata = {
  title: "AI Cover Letter Generator | Personalized Letters in 60 Seconds",
  description:
    "Create professional, tailored cover letters matched to any job description in seconds. AI-powered generator analyzes your resume and the role to write compelling cover letters. Free preview, $5 one-time payment.",
  keywords: [
    "AI cover letter generator", "best AI cover letter generator 2026",
    "personalized cover letter generator", "cover letter matched to job description",
    "professional cover letter builder", "how to write cover letter for job application",
    "cover letter writing assistant", "custom cover letter generator",
    "cover letter ATS optimization", "one-click cover letter generator",
    "cover letter for career change", "cover letter tailored to job posting",
  ],
  openGraph: {
    title: "AI Cover Letter Generator | Personalized Letters in 60 Seconds",
    description: "Upload your resume and job description. Get a professionally written, personalized cover letter in seconds. Free preview included.",
    type: "website",
    url: "https://www.starworkforcesolutions.com/tools/cover-letter",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Cover Letter Generator",
    description: "Personalized cover letters matched to any job description. Free preview, $5 one-time.",
  },
  alternates: {
    canonical: "https://www.starworkforcesolutions.com/tools/cover-letter",
  },
}

export default function CoverLetterPage() {
  return <CoverLetterClient />
}
