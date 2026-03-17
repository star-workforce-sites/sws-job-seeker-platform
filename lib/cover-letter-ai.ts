import { getOpenAIClient } from './openai'

export interface CoverLetterAIResult {
  coverLetter: string
  toneScore: number
  jobTitle: string
  companyName: string
}

/**
 * Generate an AI-powered cover letter from resume content and job description.
 * Uses GPT-4o-mini for cost efficiency (~$0.005-0.02 per call).
 */
export async function generateCoverLetter(
  resumeText: string,
  jobDescription: string
): Promise<CoverLetterAIResult> {
  try {
    const client = getOpenAIClient()

    const prompt = `You are an expert career coach and professional cover letter writer. Write a personalized, compelling cover letter based on the candidate's resume and the target job description.

CANDIDATE'S RESUME:
${resumeText.substring(0, 6000)}

TARGET JOB DESCRIPTION:
${jobDescription.substring(0, 4000)}

Write a cover letter and respond in JSON format with EXACTLY this structure (no markdown, no code blocks, just raw JSON):
{
  "coverLetter": "<the full cover letter text, 4-5 paragraphs, professional tone, personalized to the candidate's actual experience and the specific job requirements. Use specific skills and achievements from the resume. Reference specific requirements from the job description. Do NOT use generic filler. The letter should start with 'Dear Hiring Manager,' and end with 'Sincerely,\\n[Your Name]'>",
  "toneScore": <number 75-98, how professional and compelling the letter is>,
  "jobTitle": "<extracted job title from the job description>",
  "companyName": "<extracted company name from the job description, or 'your organization' if not found>"
}

IMPORTANT RULES:
- Reference SPECIFIC skills, technologies, and experiences from the resume
- Match them to SPECIFIC requirements from the job description
- Include at least one quantifiable achievement from the resume if available
- Keep the tone professional but enthusiastic
- Use natural paragraph breaks with \\n\\n between paragraphs
- The letter should be 300-450 words
- Do NOT use placeholder text like [Your Name] except for the signature line`

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Empty response from OpenAI')
    }

    const parsed = JSON.parse(content) as CoverLetterAIResult

    if (!parsed.coverLetter || parsed.coverLetter.length < 100) {
      throw new Error('Incomplete cover letter response')
    }

    return parsed
  } catch (error) {
    console.error('[COVER-AI] OpenAI generation failed, using fallback:', error)
    return generateFallbackCoverLetter(jobDescription)
  }
}

/**
 * Fallback cover letter when OpenAI is unavailable.
 * Extracts job title and company to create a basic personalized template.
 */
function generateFallbackCoverLetter(jobDescription: string): CoverLetterAIResult {
  const jobTitle = extractJobTitle(jobDescription) || 'the position'
  const company = extractCompanyName(jobDescription) || 'your organization'

  const coverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} role at ${company}. After reviewing the job description, I am confident that my background and experience align closely with the qualifications you are seeking, and I am excited about the opportunity to contribute to your team.

Throughout my career, I have developed significant expertise in the areas highlighted in your job description. My hands-on experience has consistently allowed me to deliver results and take on increasing responsibility. I am particularly drawn to this opportunity because the role's requirements match my professional strengths and career trajectory.

In my previous roles, I have successfully taken on challenges that directly relate to the responsibilities outlined in your posting. I bring a combination of technical proficiency and collaborative skills that enable me to contribute meaningfully from day one while continuing to grow within the role.

I would welcome the opportunity to discuss how my background, skills, and enthusiasm align with your team's needs. Thank you for considering my application. I look forward to the possibility of contributing to ${company}'s continued success.

Sincerely,
[Your Name]`

  return {
    coverLetter,
    toneScore: 80 + Math.floor(Math.random() * 10),
    jobTitle,
    companyName: company,
  }
}

function extractJobTitle(jobDescription: string): string | null {
  const patterns = [
    /(?:job\s+title|position|role|hiring\s+for)[:\s]+([^\n,]+)/i,
    /(?:^|\n)([A-Z][^\n,]{5,50})(?:\s+[-–]\s+|\s+at\s+|\n)/,
  ]
  for (const pattern of patterns) {
    const match = jobDescription.match(pattern)
    if (match && match[1]) return match[1].trim()
  }
  return null
}

function extractCompanyName(jobDescription: string): string | null {
  const patterns = [
    /(?:company|organization)[:\s]+([^\n,]+)/i,
    /(?:at|with)\s+([A-Z][A-Za-z0-9\s&.,-]{2,50})(?:\s+is\s+|\s+seeks\s+|\n|,)/,
  ]
  for (const pattern of patterns) {
    const match = jobDescription.match(pattern)
    if (match && match[1]) {
      const name = match[1].trim()
      if (!['the', 'our', 'this', 'a', 'an'].includes(name.toLowerCase())) {
        return name
      }
    }
  }
  return null
}
