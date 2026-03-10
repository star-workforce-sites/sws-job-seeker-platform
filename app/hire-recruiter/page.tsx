import type { Metadata } from "next"
import HireRecruiterClient from "./HireRecruiterClient"

export const metadata: Metadata = {
  title: "Hire a Dedicated Recruiter | Resume Distribution Service | STAR Workforce Solutions",
  description:
    "Subscribe to STAR Workforce Solutions recruiter-managed resume distribution service. Dedicated recruiters submit your resume to consulting and contract job opportunities daily. Services paid upfront. No placement guarantees.",
  keywords: [
    "hire a recruiter",
    "dedicated recruiter",
    "resume distribution service",
    "consulting job search",
    "contract job placement",
    "job application service",
    "recruiter subscription",
  ],
  openGraph: {
    title: "Hire a Dedicated Recruiter | STAR Workforce Solutions",
    description:
      "Let our recruiters handle your daily job applications. Consulting and contract roles. Services paid upfront. No placement guarantees.",
    type: "website",
  },
}

export default function HireRecruiterPage() {
  return <HireRecruiterClient />
}
