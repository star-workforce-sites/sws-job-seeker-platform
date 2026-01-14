import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const dynamic = "force-dynamic"
export const revalidate = 0

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { sessionId, answers } = await request.json()

    if (!sessionId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Session ID and answers required" }, { status: 400 })
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

      results.push({
        questionId: answer.questionId,
        isCorrect,
        correctAnswer: question.correct_option,
        explanation: question.explanation,
      })
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

    return NextResponse.json({
      success: true,
      score: correctCount,
      total: totalQuestions,
      percentage: percentage.toFixed(1),
      results,
    })
  } catch (error) {
    console.error("[INTERVIEW-SUBMIT] Error:", error)
    return NextResponse.json({ error: "Failed to submit answers" }, { status: 500 })
  }
}
