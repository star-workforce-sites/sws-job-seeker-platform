import type { Metadata } from "next"
import HireRecruiterClient from "./HireRecruiterClient"

export const metadata: Metadata = {
  title: "Hire a Dedicated Offshore Recruiter | Job Application Automation | STAR Workforce Solutions",
  description:
    "Hire a dedicated offshore recruiter for your job search. Job application automation service with 90-900 applications per month for consulting and contract positions. Services paid upfront.",
  keywords: [
    "hire a recruiter",
    "dedicated recruiter",
    "offshore recruiter",
    "offshore recruiter for job search",
    "job application automation",
    "job application automation service",
    "automated job applications",
    "resume distribution service",
    "consulting job search",
    "consulting recruiter service",
    "contract job placement",
    "contract job search automation",
    "job application service",
    "recruiter subscription",
  ],
  openGraph: {
    title: "Hire a Dedicated Offshore Recruiter | Job Application Automation | STAR Workforce Solutions",
    description:
      "Hire a dedicated offshore recruiter for job application automation. 90-900 applications per month for consulting and contract positions. Services paid upfront. No placement guarantees.",
    type: "website",
  },
}

export default function HireRecruiterPage() {
  return <HireRecruiterClient />
}
