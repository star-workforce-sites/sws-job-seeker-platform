import type { Metadata } from "next"
import InterviewPrepClient from "@/components/interview-prep-client"

export const metadata: Metadata = {
  title: "Interview Prep - Unlimited Practice Tests | STAR Workforce Solutions",
  description:
    "Practice unlimited interview questions based on your target job description. Test your knowledge across skills and topics with instant scoring.",
}

export default function InterviewPrepPage() {
  return <InterviewPrepClient />
}
