import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const dynamic = "force-dynamic"
export const revalidate = 0

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, email } = await request.json()

    if (!jobDescription || !email) {
      return NextResponse.json({ error: "Job description and email required" }, { status: 400 })
    }

    // Extract skills from job description using simple keyword matching
    const skillKeywords = {
      "Cloud Computing": ["aws", "azure", "gcp", "cloud", "kubernetes", "docker", "lambda", "ec2", "s3"],
      "Data Engineering": ["data", "etl", "pipeline", "spark", "hadoop", "sql", "database", "warehouse"],
      "Software Engineering": ["software", "development", "programming", "coding", "java", "python", "javascript"],
      "Machine Learning": ["ml", "machine learning", "ai", "neural", "model", "tensorflow", "pytorch"],
      DevOps: ["devops", "ci/cd", "jenkins", "terraform", "ansible", "monitoring"],
    }

    const detectedSkills: string[] = []
    const lowerDesc = jobDescription.toLowerCase()

    for (const [skill, keywords] of Object.entries(skillKeywords)) {
      if (keywords.some((keyword) => lowerDesc.includes(keyword))) {
        detectedSkills.push(skill)
      }
    }

    // Default to Software Engineering if no skills detected
    if (detectedSkills.length === 0) {
      detectedSkills.push("Software Engineering")
    }

    // Fetch 10 questions matching detected skills
    const questions = await sql`
      SELECT * FROM interview_questions 
      WHERE skill = ANY(${detectedSkills})
      ORDER BY RANDOM()
      LIMIT 10
    `

    // If not enough questions exist, we'd generate new ones here
    // For MVP, return what we have
    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No questions available for detected skills. Please try a different job description." },
        { status: 404 },
      )
    }

    // Create session
    const session = await sql`
      INSERT INTO interview_sessions (email, "jobDescription", skills, total_questions)
      VALUES (${email}, ${jobDescription}, ${JSON.stringify(detectedSkills)}, ${questions.length})
      RETURNING id, skills, total_questions
    `

    return NextResponse.json({
      success: true,
      sessionId: session[0].id,
      skills: detectedSkills,
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
