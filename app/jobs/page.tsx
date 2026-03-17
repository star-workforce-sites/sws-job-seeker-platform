import type { Metadata } from "next"
import JobsClient from "./JobsClient"

export const metadata: Metadata = {
  title: "DIY Job Search — Free Consulting & Contract Jobs | STAR Workforce Solutions",
  description: "Free DIY job search for consulting and contract positions in Software, AI, ML, Cloud, Cybersecurity, DevOps, and Data Engineering across USA and Canada. 3rd-party job aggregation coming soon.",
  openGraph: {
    title: "DIY Job Search — Free Consulting & Contract Jobs | STAR Workforce Solutions",
    description: "Free job search for consulting and contract tech jobs across USA and Canada. 3rd-party aggregation coming soon.",
    type: "website",
  },
}

export default function Page() {
  return <JobsClient />
}
