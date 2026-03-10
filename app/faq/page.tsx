import type { Metadata } from "next"
import FaqClient from "./FaqClient"

export const metadata: Metadata = {
  title: "FAQ | Resume Distribution and Recruiter Service Questions | STAR Workforce Solutions",
  description: "Frequently asked questions about STAR Workforce Solutions services including resume distribution, hire-a-recruiter subscriptions, ATS optimizer, cover letter generator, and DOL compliance.",
  openGraph: {
    title: "FAQ | STAR Workforce Solutions",
    description: "Answers to common questions about our career services, pricing, and recruiter distribution service.",
    type: "website",
  },
}

export default function Page() {
  return <FaqClient />
}
