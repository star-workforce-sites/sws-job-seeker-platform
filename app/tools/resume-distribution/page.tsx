import type { Metadata } from "next"
import ResumeDistributionClient from "@/components/resume-distribution-client"

export const metadata: Metadata = {
  title: "Resume Distribution Service | Reach 500+ Recruiters in 24 Hours",
  description:
    "Get your resume in front of 500+ hiring managers and recruiters in your industry. One-time $149 professional distribution with 12-month active placement. Bypass job boards and reach decision-makers directly.",
  keywords: [
    "resume distribution service", "resume blast to recruiters",
    "direct resume delivery service", "get resume to hiring managers",
    "reach 500 recruiters directly", "resume sent to decision makers",
    "bypass job board applications", "targeted recruiter outreach",
    "bulk resume distribution", "verified recruiter network",
    "professional resume marketing", "24-hour recruiter targeting",
  ],
  openGraph: {
    title: "Resume Distribution Service | Reach 500+ Recruiters in 24 Hours",
    description: "One-time $149 — your resume distributed to 500+ recruiters. 12-month active placement. Reach decision-makers directly.",
    type: "website",
    url: "https://www.starworkforcesolutions.com/tools/resume-distribution",
  },
  alternates: {
    canonical: "https://www.starworkforcesolutions.com/tools/resume-distribution",
  },
}

export default function ResumeDistributionPage() {
  return <ResumeDistributionClient />
}
