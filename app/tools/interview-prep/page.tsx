import type { Metadata } from "next"
import InterviewPrepClient from "@/components/interview-prep-client"

export const metadata: Metadata = {
  title: "AI Interview Coach | Mock Interviews & Real-Time Feedback",
  description:
    "Practice with AI-powered mock interviews tailored to your target role. Get instant feedback on behavioral, technical, and company-specific questions. Unlimited practice sessions with scoring to build confidence.",
  keywords: [
    "AI interview prep tool", "mock interview with AI coach",
    "best interview preparation app 2026", "behavioral interview coach AI",
    "practice job interview online", "STAR method interview prep",
    "interview question generator", "real-time interview feedback",
    "technical interview preparation", "interview confidence builder",
    "company-specific interview prep", "interview tips and coaching",
  ],
  openGraph: {
    title: "AI Interview Coach | Mock Interviews & Real-Time Feedback",
    description: "Practice with AI interviews tailored to your target role. Get instant feedback and build confidence for your next interview.",
    type: "website",
    url: "https://www.starworkforcesolutions.com/tools/interview-prep",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Interview Coach | Mock Interviews",
    description: "AI-powered mock interviews with instant scoring. Practice unlimited behavioral and technical questions.",
  },
  alternates: {
    canonical: "https://www.starworkforcesolutions.com/tools/interview-prep",
  },
}

export default function InterviewPrepPage() {
  return <InterviewPrepClient />
}
