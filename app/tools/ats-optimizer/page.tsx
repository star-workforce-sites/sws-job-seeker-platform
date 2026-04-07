import type { Metadata } from "next"
import ATSOptimizerClient from "@/components/ats-optimizer-client"

export const metadata: Metadata = {
  title: "Free AI Resume Optimizer for ATS | Pass Automated Screening in Seconds",
  description:
    "Optimize your resume for ATS systems with AI-powered keyword matching. Compare your resume to any job description, get an ATS compatibility score, and discover missing keywords. Free scan included.",
  keywords: [
    "ATS resume optimizer", "how to pass ATS screening", "ATS resume checker free",
    "resume keyword optimization tool", "best resume optimization tool 2026",
    "how to get past ATS filters", "resume scanner for ATS",
    "applicant tracking system resume format", "ATS-friendly resume",
    "resume keywords for ATS systems", "beat the ATS algorithm",
    "AI resume optimizer tool", "resume score checker",
    "Jobscan alternative", "free ATS resume checker",
  ],
  openGraph: {
    title: "Free AI Resume Optimizer for ATS | Pass Automated Screening",
    description: "Upload your resume and job description. Get instant ATS compatibility score, missing keywords, and optimization tips. Free to start.",
    type: "website",
    url: "https://www.starworkforcesolutions.com/tools/ats-optimizer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Resume Optimizer for ATS",
    description: "Get past ATS filters with AI-powered resume optimization. Free scan included.",
  },
  alternates: {
    canonical: "https://www.starworkforcesolutions.com/tools/ats-optimizer",
  },
}

export default function ATSOptimizerPage() {
  return <ATSOptimizerClient />
}
