import type { Metadata } from "next"
import PricingClient from "./PricingClient"

export const metadata: Metadata = {
  title: "Pricing | Recruiter Plans and Career Tools | STAR Workforce Solutions",
  description: "Transparent pricing for STAR Workforce Solutions career services. Hire-a-Recruiter plans from $199/month. ATS Optimizer and Cover Letter Generator one-time payments. No placement fees.",
  openGraph: {
    title: "Pricing | STAR Workforce Solutions",
    description: "Recruiter plans from $199/month. ATS Optimizer one-time payment. No placement fees.",
    type: "website",
  },
}

export default function Page() {
  return <PricingClient />
}
