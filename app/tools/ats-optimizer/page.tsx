import type { Metadata } from "next"
import ATSOptimizerClient from "@/components/ats-optimizer-client"

export const metadata: Metadata = {
  title: "Free ATS Resume Optimizer | STAR Workforce Solutions",
  description:
    "Free AI-powered ATS resume checker and optimizer. Analyze your resume for ATS compatibility, discover missing keywords, and get optimization tips to pass ATS systems and land interviews.",
  keywords: [
    "ATS optimizer",
    "resume checker",
    "ATS score",
    "resume keywords",
    "applicant tracking system",
    "free resume analysis",
  ],
  openGraph: {
    title: "Free ATS Resume Optimizer | STAR Workforce Solutions",
    description: "Free AI-powered ATS resume checker. Get instant analysis and optimization tips.",
    type: "website",
  },
}

export default function ATSOptimizerPage() {
  return <ATSOptimizerClient />
}
