import type { Metadata } from "next"
import ServicesClient from "./ServicesClient"

export const metadata: Metadata = {
  title: "Career Services | Resume Distribution & Offshore Recruiters | STAR Workforce Solutions",
  description:
    "Professional career acceleration services for consulting & contract jobs. Resume submission to 500+ recruiters, DIY job search, offshore recruiters, and AI tools for Software, AI, Cloud, Cybersecurity professionals.",
  keywords: [
    "resume distribution",
    "offshore recruiter",
    "job search services",
    "consulting jobs",
    "contract jobs",
    "ATS optimizer",
    "career services",
  ],
  openGraph: {
    title: "Career Acceleration Services | STAR Workforce Solutions",
    description: "Resume distribution, offshore recruiters, DIY job search, and AI career tools.",
    type: "website",
  },
}

export default function ServicesPage() {
  return <ServicesClient />
}
