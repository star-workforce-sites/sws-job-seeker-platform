import type { Metadata } from "next"
import ServicesClient from "./ServicesClient"

export const metadata: Metadata = {
  title: "Career Services | Resume Distribution, AI Tools & Recruiter Job Search",
  description:
    "All-in-one career acceleration for tech professionals. Resume distribution to 500+ recruiters, AI-powered ATS optimizer, cover letter generator, interview coach, and dedicated recruiter job search. Software, AI, Cloud, Cybersecurity.",
  keywords: [
    "career acceleration services", "resume distribution service",
    "all-in-one job search tool", "career services for tech professionals",
    "job search tools 2026", "tools to help me find a job faster",
    "recruiter job search service", "AI career tools",
    "resume distribution to recruiters", "consulting job services",
    "contract job placement", "career coaching services",
    "best job search tools 2026", "combined resume and interview prep",
    "career services for H1B visa holders", "job search help for STEM OPT",
    "career tools for international students", "OPT job search platform",
    "H1B friendly job search", "visa sponsorship career services",
  ],
  openGraph: {
    title: "Career Acceleration Services | AI Tools & Recruiter Job Search",
    description: "Resume distribution, AI resume optimizer, interview coach, cover letters, and dedicated recruiter job search. All-in-one career platform.",
    type: "website",
    url: "https://www.starworkforcesolutions.com/services",
  },
  alternates: {
    canonical: "https://www.starworkforcesolutions.com/services",
  },
}

export default function ServicesPage() {
  return <ServicesClient />
}
