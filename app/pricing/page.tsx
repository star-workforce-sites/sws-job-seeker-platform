import type { Metadata } from "next"
import PricingClient from "./PricingClient"

export const metadata: Metadata = {
  title: "Pricing | Recruiter Plans from $199/mo & Free AI Career Tools",
  description: "Transparent pricing for Career Accel tools. Free ATS resume optimizer, $5 cover letter generator, recruiter-assisted job search from $199/month. No placement fees, no hidden costs.",
  keywords: [
    "career services pricing", "recruiter service cost",
    "resume optimization pricing", "affordable recruiter service",
    "job search tools pricing", "career coach pricing",
    "ATS optimizer price", "cover letter generator cost",
    "recruiter subscription plans", "best value career tools",
  ],
  openGraph: {
    title: "Pricing | Recruiter Plans from $199/mo & Free AI Career Tools",
    description: "Free ATS optimizer, $5 cover letters, recruiter job search from $199/mo. No placement fees.",
    type: "website",
    url: "https://www.starworkforcesolutions.com/pricing",
  },
  alternates: {
    canonical: "https://www.starworkforcesolutions.com/pricing",
  },
}

export default function Page() {
  return <PricingClient />
}
