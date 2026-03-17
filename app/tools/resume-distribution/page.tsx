import type { Metadata } from "next"
import ResumeDistributionClient from "@/components/resume-distribution-client"

export const metadata: Metadata = {
  title: "Resume Distribution Service | STAR Workforce Solutions",
  description:
    "Get your resume distributed to 500+ recruiters for 12 months. Professional resume distribution service for $149 one-time.",
  keywords: [
    "resume distribution",
    "recruiter network",
    "job distribution",
    "professional recruiter outreach",
    "resume marketing",
  ],
  openGraph: {
    title: "Resume Distribution Service | STAR Workforce Solutions",
    description: "Get your resume distributed to 500+ recruiters. One-time $149 service.",
    type: "website",
  },
}

export default function ResumeDistributionPage() {
  return <ResumeDistributionClient />
}
