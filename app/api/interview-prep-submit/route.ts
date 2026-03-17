import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getDbUrl } from "@/lib/db"

export const dynamic = "force-dynamic"
export const revalidate = 0

const sql = neon(getDbUrl())

export async function POST(request: NextRequest) {
  try {
    const { sessionId, answers, email } = await request.json()

    if (!sessionId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Session ID and answers required" }, { status: 400 })
    }

    // Check if user has premium access
    let isPremium = false
    if (email) {
      try {
        const premiumCheck = await sql`
          SELECT id FROM premium_access
          WHERE LOWER(email) = LOWER(${email})
          AND product = 'interview-prep'
          LIMIT 1
        `
        isPremium = premiumCheck.length > 0
        console.log("[INTERVIEW-SUBMIT] Premium check for", email, ":", isPremium)
      } catch (e) {
        console.log("[INTERVIEW-SUBMIT] Premium check error:", e)
        isPremium = false
      }
    }

    // Get questions with correct answers
    const questionIds = answers.map((a) => a.questionId)
    const questions = await sql`
      SELECT id, correct_option, explanation FROM interview_questions
      WHERE id = ANY(${questionIds})
    `

    const questionMap = new Map(questions.map((q) => [q.id, q]))

    // Calculate score and store answers
    let correctCount = 0
    const results = []

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId)
      if (!question) continue

      const isCorrect = answer.userAnswer === question.correct_option

      if (isCorrect) correctCount++

      // Store answer
      await sql`
        INSERT INTO interview_answers ("sessionId", "questionId", user_answer, is_correct)
        VALUES (${sessionId}, ${answer.questionId}, ${answer.userAnswer}, ${isCorrect})
      `

      // For free users, exclude detailed feedback
      if (isPremium) {
        results.push({
          questionId: answer.questionId,
          isCorrect,
          correctAnswer: question.correct_option,
          explanation: question.explanation,
        })
      } else {
        // Free users only get basic score info
        results.push({
          questionId: answer.questionId,
          isCorrect,
        })
      }
    }

    const totalQuestions = answers.length
    const percentage = (correctCount / totalQuestions) * 100

    // Update session
    await sql`
      UPDATE interview_sessions
      SET score = ${correctCount},
          percentage = ${percentage},
          completed = true,
          "completedAt" = NOW()
      WHERE id = ${sessionId}
    `

    const response = {
      success: true,
      score: correctCount,
      total: totalQuestions,
      percentage: percentage.toFixed(1),
      isPremium: isPremium,
      results,
    }

    // Add interview readiness report for premium users only
    if (isPremium) {
      const readinessScore = Math.round(percentage)
      let readinessLevel = "Needs Improvement"
      let recommendations = []

      if (readinessScore >= 80) {
        readinessLevel = "Ready for Interview"
        recommendations = [
          "Excellent preparation! You're well-prepared for technical interviews.",
          "Focus on practicing behavioral questions and mock interviews.",
          "Review company-specific technologies mentioned in job descriptions.",
        ]
      } else if (readinessScore >= 60) {
        readinessLevel = "Moderately Prepared"
        recommendations = [
          "Review the topics where you struggled.",
          "Practice more on fundamental concepts.",
          "Study system design and problem-solving approaches.",
        ]
      } else {
        readinessLevel = "Needs Improvement"
        recommendations = [
          "Focus on core technical concepts in your area.",
          "Review incorrect answers and understand the explanations.",
          "Build a strong foundation before attempting advanced questions.",
        ]
      }

      ;(response as any).interviewReadiness = {
        readinessLevel,
        score: readinessScore,
        recommendations,
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[INTERVIEW-SUBMIT] Error:", error)
    return NextResponse.json({ error: "Failed to submit answers" }, { status: 500 })
  }
}
