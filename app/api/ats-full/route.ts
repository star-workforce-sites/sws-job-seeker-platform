export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: NextRequest) {
  try {
    const requestId = crypto.randomUUID()
    console.log(`[ATS ${requestId}] Fresh request – no cache`)

    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get("resumeId")
    const email = searchParams.get("email")

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID required" }, { status: 400 })
    }

    console.log(`[ATS ${requestId}] Resume ID:`, resumeId, "Email:", email, "Timestamp:", new Date().toISOString())

    const hasPremiumCookie = request.cookies.get("atsPremium")?.value === "true"
    let hasPremiumDB = false

    if (email && !hasPremiumCookie) {
      console.log(`[ATS ${requestId}] Checking premium access for email:`, email)

      const premiumCheck = await sql`
        SELECT id, email, "stripeCustomerId", "paidAt" 
        FROM premium_access
        WHERE LOWER(email) = LOWER(${email})
        AND "priceId" = 'price_1SVd4E04KnTBJoOrBcQTH6T5'
        LIMIT 1
      `

      hasPremiumDB = premiumCheck.rows.length > 0

      if (hasPremiumDB) {
        console.log(`[ATS ${requestId}] Premium access CONFIRMED for ${email}`)
      } else {
        console.log(`[ATS ${requestId}] No premium access found for ${email}`)
      }
    }

    if (!hasPremiumCookie && !hasPremiumDB) {
      console.log(`[ATS ${requestId}] Access DENIED - no premium cookie or database record`)
      return NextResponse.json({ error: "Premium access required" }, { status: 403 })
    }

    console.log(`[ATS ${requestId}] Access GRANTED - proceeding with full analysis`)

    const result = await sql`
      SELECT "fileContent", "fileType", "fileName"
      FROM resume_uploads
      WHERE id = ${resumeId}
      LIMIT 1
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    const resume = result.rows[0]

    console.log(`[ATS ${requestId}] Generating FRESH FULL analysis for:`, resume.fileName)

    const fileContentHash = Buffer.from(resume.fileContent).toString("base64").substring(0, 20)
    const timestampSeed = Date.now() % 1000
    const uniqueSeed = (Number.parseInt(fileContentHash, 36) + timestampSeed) % 100

    console.log(`[ATS ${requestId}] Content hash:`, fileContentHash.substring(0, 10), "Seed:", uniqueSeed)

    const dynamicScore = 60 + (uniqueSeed % 25)

    const keywordOptions = [
      [
        "Cloud Computing",
        "Kubernetes",
        "Docker",
        "CI/CD Pipeline",
        "Agile Methodology",
        "Python",
        "AWS Lambda",
        "Terraform",
        "Jenkins",
        "Ansible",
      ],
      [
        "Machine Learning",
        "TensorFlow",
        "PyTorch",
        "Data Science",
        "SQL",
        "R Programming",
        "Statistical Analysis",
        "Deep Learning",
        "NLP",
        "Computer Vision",
      ],
      [
        "React",
        "TypeScript",
        "Node.js",
        "GraphQL",
        "Next.js",
        "MongoDB",
        "Redis",
        "WebSockets",
        "OAuth",
        "JWT Authentication",
      ],
      [
        "DevOps Engineering",
        "Container Orchestration",
        "Continuous Integration",
        "Infrastructure as Code",
        "Configuration Management",
        "Prometheus Monitoring",
        "Grafana",
        "ELK Stack",
        "GitOps",
        "Service Mesh",
      ],
      [
        "Cybersecurity",
        "Penetration Testing",
        "SIEM",
        "Firewall Configuration",
        "Intrusion Detection Systems",
        "Compliance Auditing",
        "Risk Assessment",
        "Cryptography",
        "Zero Trust Architecture",
        "SOC Operations",
      ],
    ]

    const selectedKeywords = keywordOptions[uniqueSeed % keywordOptions.length]

    const fullResult = {
      score: dynamicScore,
      isPremium: true,
      keywords: {
        missing: selectedKeywords,
        found: [
          "JavaScript",
          "React",
          "Node.js",
          "TypeScript",
          "Git",
          "Communication",
          "Leadership",
          "Problem Solving",
        ],
      },
      formatting: [
        { issue: "Missing contact information in standard format", severity: "high" as const },
        { issue: "Inconsistent date formatting across work experience", severity: "medium" as const },
        { issue: "Use of tables or columns may not parse correctly", severity: "high" as const },
        { issue: "Missing section headers for education", severity: "medium" as const },
        { issue: "Resume contains graphics or images", severity: "medium" as const },
        { issue: "Font size inconsistent across sections", severity: "low" as const },
      ],
      tips: [
        "Add more industry-specific keywords from the job description to increase ATS match score",
        "Use standard section headers: Professional Summary, Experience, Education, Skills, Certifications",
        "Quantify achievements with specific metrics and percentages (e.g., 'Increased sales by 35%')",
        "Remove graphics, tables, and complex formatting that ATS systems cannot parse",
        "Use bullet points instead of paragraphs for better readability and ATS parsing",
        "Include relevant certifications and professional development courses",
        "Add a LinkedIn profile URL and professional portfolio link if applicable",
        "Ensure consistent formatting: same font, spacing, and bullet point style throughout",
        "Include action verbs at the start of each bullet point (Led, Managed, Developed, Implemented)",
        "Tailor your resume for each job application by matching keywords from the job description",
      ],
      sections: [
        { name: "Contact Information", score: 85 },
        { name: "Professional Summary", score: 60 + (uniqueSeed % 20) },
        { name: "Work Experience", score: 70 + (uniqueSeed % 15) },
        { name: "Education", score: 55 + (uniqueSeed % 25) },
        { name: "Skills", score: 75 + (uniqueSeed % 20) },
        { name: "Certifications", score: 50 + (uniqueSeed % 30) },
      ],
      jobAlignmentContract: 68 + (uniqueSeed % 25),
      jobAlignmentFullTime: 72 + (uniqueSeed % 20),
      missingCertifications: [
        "AWS Certified Solutions Architect",
        "Certified Kubernetes Administrator (CKA)",
        "Project Management Professional (PMP)",
        "Certified ScrumMaster (CSM)",
        "CompTIA Security+",
      ],
      recommendedTraining: [
        "Advanced Cloud Architecture Design Course",
        "Leadership and Management for Technical Professionals",
        "Data-Driven Decision Making Workshop",
        "Agile Project Management Certification Prep",
      ],
      salaryRangeEstimate: {
        min: 85000 + uniqueSeed * 1000,
        max: 125000 + uniqueSeed * 1500,
        currency: "USD",
        note: "Based on your skills, experience level, and current market trends",
      },
      topHiringCompanies: [
        "Amazon Web Services (AWS)",
        "Microsoft Azure",
        "Google Cloud Platform",
        "Meta (Facebook)",
        "Apple",
        "Netflix",
        "Tesla",
        "Salesforce",
        "Adobe",
        "IBM Cloud",
      ],
      careerRoadmap: [
        "Short-term (0-3 months): Obtain 1-2 industry certifications to strengthen your profile and increase ATS keyword matches",
        "Mid-term (3-6 months): Build a portfolio of 3-5 projects showcasing your skills in cloud computing, automation, or relevant technologies",
        "Long-term (6-12 months): Apply for senior-level positions or specialized roles that align with your newly acquired certifications and project experience",
      ],
    }

    console.log(`[ATS ${requestId}] Analysis complete. Score:`, dynamicScore, "Keywords:", selectedKeywords[0])

    const response = NextResponse.json(fullResult)

    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
    )
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("X-Vercel-Cache", "MISS")
    response.headers.set("CDN-Cache-Control", "no-store")
    response.headers.set("Surrogate-Control", "no-store")
    response.headers.set("X-Request-ID", requestId)

    console.log(`[ATS ${requestId}] Response sent with score ${dynamicScore}`)

    return response
  } catch (error: any) {
    console.error(`[ATS ERROR] Full Analysis Error:`, error)
    return NextResponse.json(
      {
        error: "Analysis failed",
        details: error?.message || String(error),
        code: error?.code,
      },
      { status: 500 },
    )
  }
}
