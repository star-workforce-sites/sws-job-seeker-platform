import { getOpenAIClient } from './openai'

export interface GeneratedInterviewQuestion {
  skill: string
  topic: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

/**
 * Generate multiple-choice interview questions tailored to a specific job
 * description using GPT-4o-mini. Replaces the old fixed 5-category keyword
 * matcher, which miscategorized non-tech roles and had thin question banks.
 *
 * Throws on any failure -- the caller (interview-prep-start/route.ts) is
 * responsible for catching and falling back to the static question bank.
 */
export async function generateInterviewQuestions(
  jobDescription: string,
  count: number
): Promise<GeneratedInterviewQuestion[]> {
  const client = getOpenAIClient()

  const clampedCount = Math.max(1, Math.min(count, 40))

  const prompt = `You are an expert interviewer and hiring manager. Based on the job description below, write ${clampedCount} multiple-choice interview questions that would realistically be used to screen a candidate for THIS SPECIFIC role -- covering the actual skills, tools, and responsibilities mentioned, not a generic tech quiz.

JOB DESCRIPTION:
${jobDescription.substring(0, 4000)}

Respond in JSON format with EXACTLY this structure (no markdown, no code blocks, just raw JSON):
{
  "questions": [
    {
      "skill": "<short skill/category name relevant to this specific role, e.g. 'Business Analysis', 'Stakeholder Management', 'Cloud Computing', 'Nursing', 'Sales' -- pick whatever actually fits the job, do not force it into a tech category>",
      "topic": "<specific sub-topic within that skill>",
      "difficulty": "<one of: beginner, intermediate, advanced>",
      "question": "<the interview question text>",
      "option_a": "<answer choice A>",
      "option_b": "<answer choice B>",
      "option_c": "<answer choice C>",
      "option_d": "<answer choice D>",
      "correct_option": "<one of: A, B, C, D>",
      "explanation": "<1-2 sentence explanation of why the correct answer is right>"
    }
  ]
}

IMPORTANT RULES:
- Generate exactly ${clampedCount} questions
- Base every question on the actual content of the job description -- if it's a Business Analyst role, ask about requirements gathering, stakeholder management, SQL, process mapping, etc, NOT software engineering trivia
- Mix difficulty levels (roughly 40% beginner, 40% intermediate, 20% advanced)
- Each question must have exactly 4 distinct, plausible answer options
- correct_option must be exactly one of "A", "B", "C", "D"
- Do not repeat the same question twice`

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('Empty response from OpenAI')
  }

  const parsed = JSON.parse(content) as { questions?: unknown[] }
  if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error('OpenAI returned no questions')
  }

  const valid: GeneratedInterviewQuestion[] = parsed.questions.filter((q: any): q is GeneratedInterviewQuestion => {
    return (
      q &&
      typeof q.skill === 'string' && q.skill.trim().length > 0 &&
      typeof q.topic === 'string' && q.topic.trim().length > 0 &&
      ['beginner', 'intermediate', 'advanced'].includes(q.difficulty) &&
      typeof q.question === 'string' && q.question.trim().length > 0 &&
      typeof q.option_a === 'string' && q.option_a.trim().length > 0 &&
      typeof q.option_b === 'string' && q.option_b.trim().length > 0 &&
      typeof q.option_c === 'string' && q.option_c.trim().length > 0 &&
      typeof q.option_d === 'string' && q.option_d.trim().length > 0 &&
      ['A', 'B', 'C', 'D'].includes(q.correct_option)
    )
  })

  if (valid.length === 0) {
    throw new Error('No valid questions survived validation')
  }

  return valid
}
