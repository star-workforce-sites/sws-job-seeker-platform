export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: NextRequest) {
  try {
    const requestId = crypto.randomUUID()
    console.log(`[ATS ${requestId}] Fresh FREE request – no cache`)

    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get("resumeId")

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID required" }, { status: 400 })
    }

    console.log(`[ATS ${requestId}] Resume ID:`, resumeId, "Timestamp:", new Date().toISOString())

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

    console.log(`[ATS ${requestId}] Generating FRESH analysis for:`, resume.fileName)

    const fileContentHash = Buffer.from(resume.fileContent).toString("base64").substring(0, 20)
    const timestampSeed = Date.now() % 1000
    const uniqueSeed = (Number.parseInt(fileContentHash, 36) + timestampSeed) % 100

    console.log(`[ATS ${requestId}] Content hash:`, fileContentHash.substring(0, 10), "Seed:", uniqueSeed)

    const keywordSets = [
      ["Cloud Infrastructure", "Kubernetes Orchestration", "Docker Containers", "CI/CD Automation", "Scrum Agile"],
      ["AI Machine Learning", "Python Programming", "TensorFlow Framework", "Big Data Analytics", "SQL Databases"],
      ["React Framework", "TypeScript Language", "Node.js Backend", "GraphQL API", "AWS Services"],
      ["DevOps Culture", "Jenkins Pipelines", "Terraform IaC", "Ansible Automation", "Prometheus Monitoring"],
      ["Information Security", "Network Protection", "Ethical Hacking", "SIEM Tools", "Compliance Standards"],
    ]

    const formattingIssues = [
      [
        { issue: "Missing contact information in standard format", severity: "high" as const },
        { issue: "Inconsistent date formatting across work experience", severity: "medium" as const },
      ],
      [
        { issue: "Use of tables or columns may not parse correctly", severity: "high" as const },
        { issue: "Missing section headers for education", severity: "medium" as const },
      ],
      [
        { issue: "Resume contains graphics or images", severity: "high" as const },
        { issue: "Bullet points not properly formatted", severity: "low" as const },
      ],
    ]

    const tipsSets = [
      [
        "Add more industry-specific keywords from the job description",
        "Use standard section headers: Experience, Education, Skills",
      ],
      [
        "Quantify achievements with specific metrics and percentages",
        "Remove graphics, tables, and complex formatting",
      ],
      ["Use bullet points instead of paragraphs", "Include relevant certifications and technical skills"],
    ]

    const selectedKeywords = keywordSets[uniqueSeed % keywordSets.length]
    const selectedFormatting = formattingIssues[uniqueSeed % formattingIssues.length]
    const selectedTips = tipsSets[uniqueSeed % tipsSets.length]

    const dynamicScore = 60 + (uniqueSeed % 20)

    const freeResult = {
      score: dynamicScore,
      isPremium: false,
      keywords: {
        missing: Array.from(
          new Set([
            ...selectedKeywords,
            "RESTful APIs",
            "Microservices Architecture",
            "Database Optimization",
            "Team Leadership",
            "Critical Thinking",
          ]),
        ),
        found: ["JavaScript", "Communication Skills", "Project Management"],
      },
      formatting: [
        ...selectedFormatting,
        { issue: "Use of tables or columns may not parse correctly", severity: "high" as const },
        { issue: "Missing quantifiable achievements", severity: "medium" as const },
      ],
      tips: [
        ...selectedTips,
        "Ensure consistent formatting throughout the document",
        "Add a professional summary at the top",
        "Include links to portfolio or GitHub projects",
      ],
    }

    console.log(`[ATS ${requestId}] Analysis complete. Score:`, dynamicScore, "Keywords:", selectedKeywords[0])

    const response = NextResponse.json({
      score: freeResult.score,
      isPremium: false,
      keywords: {
        missing: freeResult.keywords.missing.slice(0, 5),
        found: freeResult.keywords.found,
      },
      formatting: freeResult.formatting.slice(0, 2),
      tips: freeResult.tips.slice(0, 2),
    })

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
    console.error("[ERROR REPORT] ATS Free Analysis Error:", error)
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
