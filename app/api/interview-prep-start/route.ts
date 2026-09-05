import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getDbUrl } from "@/lib/db"
import { generateInterviewQuestions } from "@/lib/interview-prep-ai"

export const dynamic = "force-dynamic"
export const revalidate = 0

const sql = neon(getDbUrl())

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, email } = await request.json()

    if (!jobDescription || !email) {
      return NextResponse.json({ error: "Job description and email required" }, { status: 400 })
    }

    let isPremium = false
    try {
      const premiumCheck = await sql`
        SELECT id FROM premium_access
        WHERE LOWER(email) = LOWER(${email})
        AND product = 'interview-prep'
        LIMIT 1
      `
      isPremium = premiumCheck.length > 0
      console.log("[INTERVIEW-START] Premium check for", email, ":", isPremium)
    } catch (e) {
      console.log("[INTERVIEW-START] Premium check error (treating as free):", e)
      isPremium = false
    }

    const questionLimit = isPremium ? 40 : 5

    let detectedSkills: string[] = []
    let questions: any[] = []
    let usedAI = false

    try {
      const aiQuestions = await generateInterviewQuestions(jobDescription, questionLimit)

      const insertedRows: any[] = []
      for (const q of aiQuestions) {
        const rows = await sql`
          INSERT INTO interview_questions (skill, topic, difficulty, question, option_a, option_b, option_c, option_d, correct_option, explanation)
          VALUES (${q.skill}, ${q.topic}, ${q.difficulty}, ${q.question}, ${q.option_a}, ${q.option_b}, ${q.option_c}, ${q.option_d}, ${q.correct_option}, ${q.explanation})
          ON CONFLICT (skill, topic, question)
          DO UPDATE SET explanation = EXCLUDED.explanation
          RETURNING id, skill, topic, difficulty, question, option_a, option_b, option_c, option_d
        `
        if (rows[0]) insertedRows.push(rows[0])
      }

      if (insertedRows.length === 0) {
        throw new Error("No AI questions could be inserted")
      }

      questions = insertedRows
      detectedSkills = Array.from(new Set(insertedRows.map((r) => r.skill)))
      usedAI = true
      console.log(`[INTERVIEW-START] Using AI-generated questions (${questions.length}) for this job description`)
    } catch (aiError) {
      console.error("[INTERVIEW-START] AI question generation failed, falling back to static bank:", aiError)
    }

    if (!usedAI) {
      const skillKeywords = {
        "Cloud Computing": ["aws", "azure", "gcp", "cloud", "kubernetes", "docker", "lambda", "ec2", "s3"],
        "Data Engineering": ["data", "etl", "pipeline", "spark", "hadoop", "sql", "database", "warehouse"],
        "Software Engineering": ["software", "development", "programming", "coding", "java", "python", "javascript"],
        "Machine Learning": ["ml", "machine learning", "ai", "neural", "model", "tensorflow", "pytorch"],
        DevOps: ["devops", "ci/cd", "jenkins", "terraform", "ansible", "monitoring"],
      }

      const lowerDesc = jobDescription.toLowerCase()
      for (const [skill, keywords] of Object.entries(skillKeywords)) {
        if (keywords.some((keyword) => lowerDesc.includes(keyword))) {
          detectedSkills.push(skill)
        }
      }

      if (detectedSkills.length === 0) {
        detectedSkills.push("Software Engineering")
      }

      questions = await sql`
        SELECT * FROM interview_questions
        WHERE skill = ANY(${detectedSkills})
        ORDER BY RANDOM()
        LIMIT ${questionLimit}
      `

      if (questions.length === 0) {
        return NextResponse.json(
          { error: "No questions available for detected skills. Please try a different job description." },
          { status: 404 },
        )
      }
    }

    const session = await sql`
      INSERT INTO interview_sessions (email, "jobDescription", skills, total_questions)
      VALUES (${email}, ${jobDescription}, ${JSON.stringify(detectedSkills)}, ${questions.length})
      RETURNING id, skills, total_questions
    `

    return NextResponse.json({
      success: true,
      sessionId: session[0].id,
      skills: detectedSkills,
      isPremium: isPremium,
      questionLimit: questionLimit,
      source: usedAI ? "ai" : "static",
      questions: questions.map((q) => ({
        id: q.id,
        skill: q.skill,
        topic: q.topic,
        difficulty: q.difficulty,
        question: q.question,
        options: {
          A: q.option_a,
          B: q.option_b,
          C: q.option_c,
          D: q.option_d,
        },
      })),
    })
  } catch (error) {
    console.error("[INTERVIEW-START] Error:", error)
    return NextResponse.json({ error: "Failed to start interview prep" }, { status: 500 })
  }
}
