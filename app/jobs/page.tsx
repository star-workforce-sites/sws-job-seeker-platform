import type { Metadata } from "next"
import JobsClient from "./JobsClient"

export const metadata: Metadata = {
  title: "Free Job Board | Real-Time Tech, AI & Cloud Job Listings",
  description: "Browse thousands of active consulting and contract jobs in Software, AI, ML, Cloud, Cybersecurity, DevOps, and Data Engineering. Real-time listings updated daily. Free to search, filter, and save jobs.",
  keywords: [
    "free job board", "tech job listings", "consulting jobs",
    "contract job search", "AI jobs", "cloud computing jobs",
    "cybersecurity jobs", "DevOps jobs", "data engineering jobs",
    "remote tech jobs", "job board for US job seekers",
    "real-time job listings", "software engineer jobs",
    "job search tool 2026", "best job board for tech professionals",
  ],
  openGraph: {
    title: "Free Job Board | Real-Time Tech, AI & Cloud Job Listings",
    description: "Browse active consulting and contract jobs in Software, AI, Cloud, and more. Real-time listings, free to search.",
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
