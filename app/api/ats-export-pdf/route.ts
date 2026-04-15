import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { jsPDF } from "jspdf"

// Color scheme
const NAVY = { r: 10, g: 26, b: 47 }
const GOLD = { r: 232, g: 197, b: 71 }
const DARK_GRAY = { r: 60, g: 60, b: 60 }
const MEDIUM_GRAY = { r: 100, g: 100, b: 100 }
const LIGHT_GRAY = { r: 150, g: 150, b: 150 }
const RED = { r: 220, g: 53, b: 69 }
const ORANGE = { r: 255, g: 159, b: 64 }
const YELLOW = { r: 255, g: 193, b: 7 }
const GREEN = { r: 52, g: 168, b: 83 }

const MARGIN_LEFT = 40
const MARGIN_RIGHT = 40
const MARGIN_TOP = 50
const MARGIN_BOTTOM = 40
const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT

interface Analysis {
  score: number
  keywords: { found: string[]; missing: string[] }
  formatting: Array<{ issue: string; severity: "high" | "medium" | "low" }>
  tips: string[]
  sections: Array<{ name: string; score: number }>
  jobAlignmentContract: number
  jobAlignmentContractExplanation: string
  jobAlignmentFullTime: number
  jobAlignmentFullTimeExplanation: string
  missingCertifications: string[]
  recommendedTraining: string[]
  isPremium: boolean
}

function addPageNumber(doc: jsPDF, pageNumber: number, totalPages: number) {
  doc.setFontSize(9)
  doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b)
  doc.text(
    `Page ${pageNumber} of ${totalPages}`,
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - MARGIN_BOTTOM + 15,
    { align: "center" },
  )
}

function addHeader(doc: jsPDF, title: string, yPos: number): number {
  doc.setDrawColor(NAVY.r, NAVY.g, NAVY.b)
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b)
  doc.rect(MARGIN_LEFT, yPos - 2, CONTENT_WIDTH, 12, "F")

  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text(title, MARGIN_LEFT + 5, yPos + 6)

  return yPos + 14
}

function addSubsection(doc: jsPDF, title: string, yPos: number): number {
  doc.setFontSize(12)
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b)
  doc.setFont("helvetica", "bold")
  doc.text(title, MARGIN_LEFT, yPos)
  doc.setFont("helvetica", "normal")
  return yPos + 7
}

function checkPageBreak(doc: jsPDF, yPos: number, neededSpace: number = 20): number {
  if (yPos + neededSpace > PAGE_HEIGHT - MARGIN_BOTTOM) {
    doc.addPage()
    return MARGIN_TOP
  }
  return yPos
}

function drawScoreBar(
  doc: jsPDF,
  score: number,
  yPos: number,
  label: string,
  explanation: string,
): number {
  const barWidth = 100
  const barHeight = 8
  const x = MARGIN_LEFT

  doc.setFontSize(11)
  doc.setTextColor(DARK_GRAY.r, DARK_GRAY.g, DARK_GRAY.b)
  doc.setFont("helvetica", "bold")
  doc.text(label, x, yPos)

  yPos += 8

  // Draw background bar
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(230, 230, 230)
  doc.rect(x, yPos, barWidth, barHeight, "FD")

  // Draw score bar
  const scoreColor = score >= 75 ? GREEN : score >= 50 ? ORANGE : RED
  doc.setFillColor(scoreColor.r, scoreColor.g, scoreColor.b)
  doc.rect(x, yPos, (barWidth * score) / 100, barHeight, "F")

  doc.setFontSize(10)
  doc.setTextColor(DARK_GRAY.r, DARK_GRAY.g, DARK_GRAY.b)
  doc.setFont("helvetica", "bold")
  doc.text(`${score}%`, x + barWidth + 8, yPos + 6)

  yPos += barHeight + 6

  // Add explanation text
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(DARK_GRAY.r, DARK_GRAY.g, DARK_GRAY.b)
  const explanationLines = doc.splitTextToSize(explanation, CONTENT_WIDTH - 20)
  doc.text(explanationLines, x + 10, yPos)

  return yPos + explanationLines.length * 5 + 10
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get("resumeId")

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID required" }, { status: 400 })
    }

    // Check if user has premium access
    const hasPremiumCookie = request.cookies.get("atsPremium")?.value === "true"

    if (!hasPremiumCookie) {
      return NextResponse.json({ error: "Premium access required" }, { status: 403 })
    }

    // Get resume and analysis from database
    const result = await sql`
      SELECT "fileName", "analysisCache", "userEmail"
      FROM resume_uploads
      WHERE id = ${resumeId}
      LIMIT 1
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    const { fileName, analysisCache, userEmail } = result.rows[0]
    const analysis = (analysisCache || {}) as Analysis

    if (!analysis) {
      return NextResponse.json(
        { error: "No analysis found. Please run an analysis first." },
        { status: 404 },
      )
    }

    const doc = new jsPDF()
    let currentPage = 1
    const totalPages = 5

    // ===== PAGE 1: COVER/SUMMARY =====
    // Navy header bar
    doc.setDrawColor(NAVY.r, NAVY.g, NAVY.b)
    doc.setFillColor(NAVY.r, NAVY.g, NAVY.b)
    doc.rect(0, 0, PAGE_WIDTH, 40, "F")

    // STAR header
    doc.setFontSize(18)
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.text("STAR Workforce Solutions", PAGE_WIDTH / 2, 15, { align: "center" })

    doc.setFontSize(10)
    doc.setTextColor(GOLD.r, GOLD.g, GOLD.b)
    doc.setFont("helvetica", "normal")
    doc.text("Professional Career Optimization", PAGE_WIDTH / 2, 25, { align: "center" })

    // Title
    doc.setFontSize(24)
    doc.setTextColor(NAVY.r, NAVY.g, NAVY.b)
    doc.setFont("helvetica", "bold")
    doc.text("ATS Resume Analysis Report", PAGE_WIDTH / 2, 70, { align: "center" })

    // Report date
    doc.setFontSize(11)
    doc.setTextColor(MEDIUM_GRAY.r, MEDIUM_GRAY.g, MEDIUM_GRAY.b)
    doc.setFont("helvetica", "normal")
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, PAGE_WIDTH / 2, 80, {
      align: "center",
    })

    if (userEmail) {
      doc.text(`Candidate: ${userEmail || ""}`, PAGE_WIDTH / 2, 87, { align: "center" })
    }

    // Score circle
    const scoreCircleY = 130
    const scoreRadius = 25
    doc.setFillColor(NAVY.r, NAVY.g, NAVY.b)
    doc.circle(PAGE_WIDTH / 2, scoreCircleY, scoreRadius, "F")

    doc.setFontSize(36)
    doc.setTextColor(GOLD.r, GOLD.g, GOLD.b)
    doc.setFont("helvetica", "bold")
    doc.text(`${analysis.score ?? 0}`, PAGE_WIDTH / 2, scoreCircleY + 8, { align: "center" })

    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "normal")
    doc.text("ATS Score", PAGE_WIDTH / 2, scoreCircleY + 18, { align: "center" })

    // Summary text
    doc.setFontSize(13)
    doc.setTextColor(DARK_GRAY.r, DARK_GRAY.g, DARK_GRAY.b)
    doc.setFont("helvetica", "bold")
    doc.text("Your Resume Summary", PAGE_WIDTH / 2, 175, { align: "center" })

    const scoreInterpretation =
      (analysis.score ?? 0) >= 80
        ? "Excellent! Your resume is well-optimized for ATS systems and ready for submission."
        : (analysis.score ?? 0) >= 60
          ? "Good foundation. Your resume has solid ATS compatibility with room for improvement."
          : "Your resume needs optimization to improve ATS compatibility and increase visibility."

    doc.setFontSize(11)
    doc.setTextColor(DARK_GRAY.r, DARK_GRAY.g, DARK_GRAY.b)
    doc.setFont("helvetica", "normal")
    const summaryLines = doc.splitTextToSize(scoreInterpretation, CONTENT_WIDTH)
    doc.text(summaryLines, PAGE_WIDTH / 2, 185, { align: "center" })

    addPageNumber(doc, currentPage, totalPages)
    currentPage++

    // ===== PAGE 2: KEYWORD ANALYSIS =====
    doc.addPage()
    let yPos = addHeader(doc, "Keyword Analysis", MARGIN_TOP)
    yPos += 5

    // Keywords Found
    yPos = addSubsection(doc, "Keywords Found", yPos)
    yPos += 3

    if (analysis.keywords?.found && analysis.keywords.found.length > 0) {
      const foundKeywords = analysis.keywords.found
      const columnWidth = CONTENT_WIDTH / 2 - 5
      let col = 0
      let colY = yPos

      doc.setFontSize(10)
      doc.setTextColor(GREEN.r, GREEN.g, GREEN.b)
      foundKeywords.forEach((keyword) => {
        if (colY + 5 > PAGE_HEIGHT - MARGIN_BOTTOM - 20) {
          yPos = PAGE_HEIGHT - MARGIN_BOTTOM - 20
          col = 0
          colY = yPos + 5
        }

        const x = MARGIN_LEFT + col * (columnWidth + 5)
        doc.text("✓ " + keyword, x, colY)
        colY += 5

        if (colY > yPos && col === 0) {
          yPos = colY
        }
      })
      yPos = Math.max(yPos, colY) + 5
    } else {
      doc.setFontSize(10)
      doc.setTextColor(DARK_GRAY.r, DARK_GRAY.g, DARK_GRAY.b)
      doc.text("No keywords found in your resume.", MARGIN_LEFT, yPos)
      yPos += 5
    }

    yPos += 8

    // Missing Keywords
    yPos = addSubsection(doc, "Missing Keywords", yPos)
    yPos += 3

    if (analysis.keywords?.missing && analysis.keywords.missing.length > 0) {
      const missingKeywords = analysis.keywords.missing.slice(0, 15)
      const columnWidth = CONTENT_WIDTH / 2 - 5
      let col = 0
      let colY = yPos

      doc.setFontSize(10)
      doc.setTextColor(RED.r, RED.g, RED.b)
      missingKeywords.forEach((keyword) => {
        if (colY + 5 > PAGE_HEIGHT - MARGIN_BOTTOM - 20) {
          yPos = PAGE_HEIGHT - MARGIN_BOTTOM - 20
          col = 0
          colY = yPos + 5
        }

        const x = MARGIN_LEFT + col * (columnWidth + 5)
        doc.text("✗ " + keyword, x, colY)
        colY += 5

        if (colY > yPos && col === 0) {
          yPos = colY
        }
      })
      yPos = Math.max(yPos, colY)
    }

    yPos += 8

    // Section Scores Table
    if (analysis.sections && analysis.sections.length > 0) {
      yPos = addSubsection(doc, "Section Scores", yPos)
      yPos += 5

      doc.setFontSize(9)
      doc.setDrawColor(NAVY.r, NAVY.g, NAVY.b)
      const colWidth = CONTENT_WIDTH / 2
      let sectionIndex = 0

      ;(analysis.sections as any[]).forEach((section: any) => {
        if (yPos + 8 > PAGE_HEIGHT - MARGIN_BOTTOM - 15) {
          doc.addPage()
          yPos = MARGIN_TOP + 20
        }

        const col = sectionIndex % 2
        const row = Math.floor(sectionIndex / 2)
        const x = MARGIN_LEFT + col * (colWidth + 5)
        const currentY = yPos + row * 8

        doc.setTextColor(DARK_GRAY.r, DARK_GRAY.g, DARK_GRAY.b)
        doc.text(`${section?.name || ""}:`, x, currentY)
        doc.setFont("helvetica", "bold")
        doc.text(`${section?.score ?? 0}%`, x + colWidth - 15, currentY)
        doc.setFont("helvetica", "normal")

        sectionIndex++
        if (col === 1) {
          yPos += 10
        }
      })

      yPos += 5
    }

    addPageNumber(doc, currentPage, totalPages)
    currentPage++

    // ===== PAGE 3: JOB ALIGNMENT =====
    doc.addPage()
    yPos = addHeader(doc, "Career Alignment Analysis", MARGIN_TOP)
    yPos += 8

    // Full-Time Alignment
    yPos = drawScoreBar(
      doc,
      analysis.jobAlignmentFullTime ?? 0,
      yPos,
      "Full-Time Permanent Alignment",
      analysis.jobAlignmentFullTimeExplanation ?? "",
    )
    yPos += 8

    // Contract Alignment
    yPos = drawScoreBar(
      doc,
      analysis.jobAlignmentContract ?? 0,
      yPos,
      "Contract/Consulting Alignment",
      analysis.jobAlignmentContractExplanation ?? "",
    )
    yPos += 12

    // Disclaimer
    doc.setFontSize(9)
    doc.setTextColor(MEDIUM_GRAY.r, MEDIUM_GRAY.g, MEDIUM_GRAY.b)
    doc.setFont("helvetica", "italic")
    const disclaimerText = doc.splitTextToSize(
      "AI-generated analysis — for informational purposes only. This assessment is based on AI analysis and should be used as a guide alongside professional career counseling.",
      CONTENT_WIDTH,
    )
    doc.text(disclaimerText, MARGIN_LEFT, yPos)

    addPageNumber(doc, currentPage, totalPages)
    currentPage++

    // ===== PAGE 4: IMPROVEMENT RECOMMENDATIONS =====
    doc.addPage()
    yPos = addHeader(doc, "Optimization Recommendations", MARGIN_TOP)
    yPos += 8

    // Formatting Issues Table
    if (analysis.formatting && analysis.formatting.length > 0) {
      yPos = addSubsection(doc, "Formatting Issues by Severity", yPos)
      yPos += 5

      doc.setFontSize(9)
      ;(analysis.formatting as any[]).forEach((issue: any) => {
        yPos = checkPageBreak(doc, yPos, 10)

        let color = LIGHT_GRAY
        if (issue?.severity === "high") color = RED
        else if (issue?.severity === "medium") color = ORANGE
        else if (issue?.severity === "low") color = YELLOW

        doc.setFillColor(color.r, color.g, color.b)
        doc.rect(MARGIN_LEFT, yPos - 3, 12, 5, "F")

        doc.setTextColor(DARK_GRAY.r, DARK_GRAY.g, DARK_GRAY.b)
        const severityLabel =
          issue?.severity === "high" ? "HIGH" : issue?.severity === "medium" ? "MED" : "LOW"
        doc.setFont("helvetica", "bold")
        doc.setFontSize(8)
        doc.text(severityLabel, MARGIN_LEFT + 2, yPos + 1)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        const issueLines = doc.splitTextToSize(issue?.issue || "", CONTENT_WIDTH - 20)
        doc.text(issueLines, MARGIN_LEFT + 16, yPos, { maxWidth: CONTENT_WIDTH - 20 })
        yPos += Math.max(5, issueLines.length * 4) + 3
      })

      yPos += 5
    }

    // Tips
    if (analysis.tips && analysis.tips.length > 0) {
      yPos = checkPageBreak(doc, yPos, 20)
      yPos = addSubsection(doc, "Top Optimization Tips", yPos)
      yPos += 5

      doc.setFontSize(10)
      doc.setTextColor(DARK_GRAY.r, DARK_GRAY.g, DARK_GRAY.b)
      ;(analysis.tips as any[]).slice(0, 8).forEach((tip: any, idx: number) => {
        yPos = checkPageBreak(doc, yPos, 8)
        doc.setFont("helvetica", "bold")
        doc.text(`${idx + 1}.`, MARGIN_LEFT, yPos)
        doc.setFont("helvetica", "normal")
        const tipLines = doc.splitTextToSize(tip || "", CONTENT_WIDTH - 8)
        doc.text(tipLines, MARGIN_LEFT + 6, yPos)
        yPos += tipLines.length * 4.5 + 2
      })
    }

    addPageNumber(doc, currentPage, totalPages)
    currentPage++

    // ===== PAGE 5: CAREER DEVELOPMENT =====
    doc.addPage()
    yPos = addHeader(doc, "Career Development", MARGIN_TOP)
    yPos += 8

    // Missing Certifications
    if (analysis.missingCertifications && analysis.missingCertifications.length > 0) {
      yPos = addSubsection(doc, "Recommended Certifications", yPos)
      yPos += 4

      doc.setFontSize(10)
      doc.setTextColor(DARK_GRAY.r, DARK_GRAY.g, DARK_GRAY.b)
      ;(analysis.missingCertifications as any[]).slice(0, 5).forEach((cert: any) => {
        yPos = checkPageBreak(doc, yPos, 6)
        doc.text(`• ${cert || ""}`, MARGIN_LEFT + 5, yPos)
        yPos += 5
      })
      yPos += 3
    }

    // Recommended Training
    if (analysis.recommendedTraining && analysis.recommendedTraining.length > 0) {
      yPos = checkPageBreak(doc, yPos, 20)
      yPos = addSubsection(doc, "Recommended Training Programs", yPos)
      yPos += 4

      doc.setFontSize(10)
      doc.setTextColor(DARK_GRAY.r, DARK_GRAY.g, DARK_GRAY.b)
      ;(analysis.recommendedTraining as any[]).slice(0, 5).forEach((training: any) => {
        yPos = checkPageBreak(doc, yPos, 6)
        doc.text(`• ${training || ""}`, MARGIN_LEFT + 5, yPos)
        yPos += 5
      })
      yPos += 8
    }

    // Cross-sell offers
    yPos = checkPageBreak(doc, yPos, 25)
    doc.setDrawColor(GOLD.r, GOLD.g, GOLD.b)
    doc.setFillColor(255, 250, 230)
    doc.rect(MARGIN_LEFT, yPos, CONTENT_WIDTH, 18, "FD")

    doc.setFontSize(10)
    doc.setTextColor(NAVY.r, NAVY.g, NAVY.b)
    doc.setFont("helvetica", "bold")
    doc.text("Additional Resources", MARGIN_LEFT + 8, yPos + 5)

    doc.setFontSize(9)
    doc.setTextColor(DARK_GRAY.r, DARK_GRAY.g, DARK_GRAY.b)
    doc.setFont("helvetica", "normal")
    doc.text(
      "→ Interview Preparation: starworkforcesolutions.com/tools/interview-prep",
      MARGIN_LEFT + 8,
      yPos + 10,
    )
    doc.text(
      "→ Professional Cover Letter: starworkforcesolutions.com/tools/cover-letter",
      MARGIN_LEFT + 8,
      yPos + 15,
    )

    yPos += 22

    // Footer
    doc.setFontSize(9)
    doc.setTextColor(LIGHT_GRAY.r, LIGHT_GRAY.g, LIGHT_GRAY.b)
    doc.setFont("helvetica", "normal")
    doc.text(
      "Generated by STAR Workforce Solutions | starworkforcesolutions.com",
      PAGE_WIDTH / 2,
      PAGE_HEIGHT - MARGIN_BOTTOM + 5,
      { align: "center" },
    )

    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    const footerDisclaimer = doc.splitTextToSize(
      "AI-generated analysis — for informational purposes only.",
      CONTENT_WIDTH,
    )
    doc.text(footerDisclaimer, PAGE_WIDTH / 2, PAGE_HEIGHT - MARGIN_BOTTOM + 12, {
      align: "center",
    })

    addPageNumber(doc, currentPage, totalPages)

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))
    const originalName = (fileName || "resume").replace(/\.[^/.]+$/, "")

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${originalName}_STAR_Optimizer_Report.pdf"`,
      },
    })
  } catch (error: any) {
    console.error("[ERROR REPORT] PDF Export Error:", error)
    return NextResponse.json(
      {
        error: "PDF generation failed",
        details: error?.message || String(error),
        code: error?.code,
      },
      { status: 500 },
    )
  }
}
