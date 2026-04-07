import type { Metadata } from "next"
import FaqClient from "./FaqClient"

export const metadata: Metadata = {
  title: "FAQ | Common Questions About ATS Optimization, Recruiter Service & Career Tools",
  description: "Answers to common questions about ATS resume optimization, recruiter-assisted job search, resume distribution, cover letter generation, interview prep, pricing, and DOL compliance.",
  keywords: [
    "ATS resume optimizer FAQ", "recruiter service questions",
    "resume distribution FAQ", "how does ATS screening work",
    "what is recruiter-assisted job search", "career tools FAQ",
    "job search help questions", "cover letter generator FAQ",
  ],
  openGraph: {
    title: "FAQ | Career Accel Platform Questions & Answers",
    description: "Answers to common questions about ATS optimization, recruiter services, pricing, and career tools.",
    type: "website",
    url: "https://www.starworkforcesolutions.com/faq",
  },
  alternates: {
    canonical: "https://www.starworkforcesolutions.com/faq",
  },
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does the ATS resume optimizer work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Upload your resume and the AI analyzes it for ATS compatibility. You receive an ATS score, keyword analysis, section-by-section breakdown, and actionable suggestions to help pass automated screening systems."
      }
    },
    {
      "@type": "Question",
      "name": "How does the resume distribution service work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Submit your resume once for $149. Your professional profile is distributed to 500+ recruiters and hiring managers in your industry for 12 months. Recruiters contact you directly with matching opportunities."
      }
    },
    {
      "@type": "Question",
      "name": "What is included in the recruiter-assisted job search?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A dedicated recruiter applies to jobs on your behalf daily. Plans range from Basic (5 applications/day) to Pro (30 applications/day) with advanced dashboards, weekly reports, and priority support."
      }
    },
    {
      "@type": "Question",
      "name": "Can I cancel my subscription anytime?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. You can cancel your subscription anytime with no penalties or hidden fees. Changes take effect at your next billing cycle."
      }
    },
    {
      "@type": "Question",
      "name": "Does STAR Workforce Solutions guarantee employment?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. STAR is a resume marketing and career tools platform, not a staffing agency. Employment outcomes depend on your qualifications, market conditions, and recruiter decisions."
      }
    },
    {
      "@type": "Question",
      "name": "What industries and positions does the platform serve?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The platform serves Software, AI, Machine Learning, Cloud, Cybersecurity, Data Engineering, DevOps, and High-Tech industries. Positions are consulting and contract roles across the USA and Canada."
      }
    },
    {
      "@type": "Question",
      "name": "Will my sensitive information be protected?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The system auto-redacts sensitive data like SSN and dates of birth. All data is encrypted with industry-standard protocols and never shared without your consent."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer refunds?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. All services come with a 14-day money-back guarantee. Contact support for refund requests within 14 days of purchase."
      }
    }
  ]
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FaqClient />
    </>
  )
}
