import type { Metadata } from "next"
import HireRecruiterClient from "./HireRecruiterClient"

export const metadata: Metadata = {
  title: "Hire an Offshore Recruiter | STAR Workforce Solutions",
  description:
    "Professional recruiters submit 3-30 applications per day for you. 90% feedback success rate. Starting at $199/month for consulting & contract jobs.",
  keywords: [
    "offshore recruiter",
    "job application service",
    "recruiter for hire",
    "consulting jobs",
    "contract jobs",
    "job search automation",
  ],
  openGraph: {
    title: "Hire an Offshore Recruiter | STAR Workforce Solutions",
    description: "90-900 job applications per month on autopilot. 90% feedback success rate.",
    type: "website",
  },
}

export default function HireRecruiterPage() {
  return <HireRecruiterClient />
}
