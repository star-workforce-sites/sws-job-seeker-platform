import type { Metadata } from "next"
import JobsClient from "./JobsClient"

export const metadata: Metadata = {
  title: "Tech Jobs with Visa Sponsorship | H1B, STEM OPT & Contract Listings",
  description: "Browse thousands of active consulting and contract jobs in Software, AI, ML, Cloud, Cybersecurity, DevOps, and Data Engineering. Many roles open to H1B visa holders, STEM OPT, and international candidates. Real-time listings updated daily.",
  keywords: [
    "free job board", "tech job listings", "consulting jobs",
    "contract job search", "AI jobs", "cloud computing jobs",
    "cybersecurity jobs", "DevOps jobs", "data engineering jobs",
    "remote tech jobs", "software engineer jobs",
    "H1B visa sponsorship jobs", "H1B jobs USA 2026",
    "STEM OPT jobs", "OPT friendly employers",
    "jobs for international students", "visa sponsorship tech jobs",
    "contract jobs for H1B holders", "EAD jobs",
    "CPT jobs for students", "F1 visa jobs",
    "IT consulting jobs H1B", "real-time job listings",
    "best job board for tech professionals",
  ],
  openGraph: {
    title: "Tech Jobs with Visa Sponsorship | H1B, STEM OPT & Contract Listings",
    description: "Browse consulting and contract tech jobs open to H1B, STEM OPT, and international candidates. Real-time listings, free to search.",
    type: "website",
    url: "https://www.starworkforcesolutions.com/jobs",
  },
  alternates: {
    canonical: "https://www.starworkforcesolutions.com/jobs",
  },
}

export default function Page() {
  return <JobsClient />
}
