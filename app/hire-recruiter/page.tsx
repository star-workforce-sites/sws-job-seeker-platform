import type { Metadata } from "next"
import HireRecruiterClient from "./HireRecruiterClient"

export const metadata: Metadata = {
  title: "Recruiter Job Search Service | A Real Recruiter Applies to Jobs for You",
  description:
    "Stop applying alone. Hire a dedicated recruiter who applies to 90-900 jobs per month on your behalf. Monthly subscription for consulting and contract positions in tech. Plans from $199/month.",
  keywords: [
    "recruiter applies for jobs for you", "monthly recruiter service",
    "done-for-you job search", "job search automation service",
    "recruiter subscription service", "personal recruiter service",
    "hire a recruiter for job search", "dedicated recruiter service",
    "automated job application service", "recruiter-managed job search",
    "professional job search assistant", "job application service",
    "consulting job recruiter", "contract job placement service",
    "how to work with a recruiter", "hidden job market access",
    "H1B job search help", "H1B visa job search service",
    "recruiter for international workers", "STEM OPT job search assistance",
    "job search service for visa holders", "OPT job placement help",
    "job search support for immigrants", "H1B transfer jobs recruiter",
  ],
  openGraph: {
    title: "Recruiter Job Search Service | A Real Recruiter Applies for You",
    description: "Hire a dedicated recruiter who applies to 90-900 jobs monthly on your behalf. Plans from $199/month. No placement fees.",
    type: "website",
    url: "https://www.starworkforcesolutions.com/hire-recruiter",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recruiter Applies to Jobs for You | Monthly Subscription",
    description: "A dedicated recruiter handles your job applications. 90-900 applications per month. From $199/mo.",
  },
  alternates: {
    canonical: "https://www.starworkforcesolutions.com/hire-recruiter",
  },
}

export default function HireRecruiterPage() {
  return <HireRecruiterClient />
}
