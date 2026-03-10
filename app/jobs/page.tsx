import type { Metadata } from "next"
import JobsClient from "./JobsClient"

export const metadata: Metadata = {
  title: "Consulting and Contract Jobs USA Canada | STAR Workforce Solutions",
  description: "Browse consulting and contract job openings in Software, AI, ML, Cloud, Cybersecurity, DevOps, and Data Engineering across USA and Canada. Apply directly or use our recruiter distribution service.",
  openGraph: {
    title: "Consulting and Contract Jobs | STAR Workforce Solutions",
    description: "Browse and apply to consulting and contract tech jobs across USA and Canada.",
    type: "website",
  },
}

export default function Page() {
  return <JobsClient />
}
