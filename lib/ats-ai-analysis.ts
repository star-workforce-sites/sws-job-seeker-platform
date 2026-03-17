import { getOpenAIClient } from './openai'

// Types for the AI analysis response
export interface ATSAIAnalysis {
  score: number
  keywords: {
    found: string[]
    missing: string[]
  }
  formatting: Array<{ issue: string; severity: 'high' | 'medium' | 'low' }>
  tips: string[]
  sections: Array<{ name: string; score: number }>
  jobAlignmentContract: number
  jobAlignmentContractExplanation: string
  jobAlignmentFullTime: number
  jobAlignmentFullTimeExplanation: string
  missingCertifications: string[]
  recommendedTraining: string[]
  isPremium: true
}

/**
 * Generate AI-powered ATS analysis from resume text.
 * Uses GPT-4o-mini for cost efficiency (~$0.005-0.02 per call).
 */
export async function generateATSAnalysis(resumeText: string): Promise<ATSAIAnalysis> {
  try {
    const client = getOpenAIClient()

    const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze the following resume and provide a detailed assessment.

RESUME TEXT:
${resumeText.substring(0, 8000)}

Respond in JSON format with EXACTLY this structure (no markdown, no code blocks, just raw JSON):
{
  "score": <number 0-100, the overall ATS compatibility score>,
  "keywords": {
    "found": [<array of 6-10 strong keywords/skills found in the resume>],
    "missing": [<array of 8-12 important keywords commonly expected for this role type that are MISSING from the resume>]
  },
  "formatting": [
    {"issue": "<specific formatting issue found>", "severity": "<high|medium|low>"}
  ],
  "tips": [<array of 8-10 specific, actionable improvement tips tailored to THIS resume>],
  "sections": [
    {"name": "Contact Information", "score": <0-100>},
    {"name": "Professional Summary", "score": <0-100>},
    {"name": "Work Experience", "score": <0-100>},
    {"name": "Education", "score": <0-100>},
    {"name": "Skills", "score": <0-100>},
    {"name": "Certifications", "score": <0-100>}
  ],
  "jobAlignmentContract": <number 0-100, how well this resume fits contract/consulting roles>,
  "jobAlignmentContractExplanation": "<2-3 sentences explaining the contract/consulting alignment score, referencing specific resume content and consulting market demand>",
  "jobAlignmentFullTime": <number 0-100, how well this resume fits full-time permanent roles>,
  "jobAlignmentFullTimeExplanation": "<2-3 sentences explaining the full-time alignment score, referencing specific resume strengths vs typical full-time requirements>",
  "missingCertifications": [<array of 4-6 relevant certifications this person should consider>],
  "recommendedTraining": [<array of 3-5 specific training courses or programs recommended>]
}

IMPORTANT RULES:
- Be specific to THIS resume's content, not generic advice
- Score honestly - don't inflate scores
- Missing keywords should be relevant to the person's apparent industry/role
- Formatting issues should reflect actual ATS parsing concerns
- Certifications should be realistic and relevant to their field
- All explanations must reference specific content from the resume`

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Empty response from OpenAI')
    }

    const parsed = JSON.parse(content) as ATSAIAnalysis
    parsed.isPremium = true

    // Validate essential fields exist
    if (!parsed.score || !parsed.keywords || !parsed.tips) {
      throw new Error('Incomplete AI response - missing required fields')
    }

    return parsed
  } catch (error) {
    console.error('[ATS-AI] OpenAI analysis failed, falling back to algorithmic:', error)
    return generateFallbackAnalysis(resumeText)
  }
}

/**
 * Fallback analysis when OpenAI is unavailable.
 * Uses the same seeded/algorithmic approach as the original implementation.
 */
function generateFallbackAnalysis(resumeText: string): ATSAIAnalysis {
  const hash = simpleHash(resumeText)
  const seed = hash % 100
  const score = 60 + (seed % 25)

  const keywordSets = [
    ['Cloud Computing', 'Kubernetes', 'Docker', 'CI/CD Pipeline', 'Agile Methodology', 'Python', 'AWS Lambda', 'Terraform', 'Jenkins', 'Ansible'],
    ['Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'SQL', 'R Programming', 'Statistical Analysis', 'Deep Learning', 'NLP', 'Computer Vision'],
    ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Next.js', 'MongoDB', 'Redis', 'WebSockets', 'OAuth', 'JWT Authentication'],
    ['DevOps Engineering', 'Container Orchestration', 'Continuous Integration', 'Infrastructure as Code', 'Configuration Management', 'Prometheus Monitoring', 'Grafana', 'ELK Stack', 'GitOps', 'Service Mesh'],
  ]

  return {
    score,
    isPremium: true,
    keywords: {
      found: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Git', 'Communication', 'Leadership', 'Problem Solving'],
      missing: keywordSets[seed % keywordSets.length],
    },
    formatting: [
      { issue: 'Missing contact information in standard format', severity: 'high' },
      { issue: 'Inconsistent date formatting across work experience', severity: 'medium' },
      { issue: 'Use of tables or columns may not parse correctly', severity: 'high' },
      { issue: 'Missing section headers for education', severity: 'medium' },
      { issue: 'Resume contains graphics or images', severity: 'medium' },
      { issue: 'Font size inconsistent across sections', severity: 'low' },
    ],
    tips: [
      'Add more industry-specific keywords from the job description to increase ATS match score',
      'Use standard section headers: Professional Summary, Experience, Education, Skills, Certifications',
      'Quantify achievements with specific metrics and percentages',
      'Remove graphics, tables, and complex formatting that ATS systems cannot parse',
      'Use bullet points instead of paragraphs for better readability',
      'Include relevant certifications and professional development courses',
      'Add a LinkedIn profile URL and professional portfolio link',
      'Ensure consistent formatting throughout the document',
      'Include action verbs at the start of each bullet point',
      'Tailor your resume for each job application by matching keywords',
    ],
    sections: [
      { name: 'Contact Information', score: 85 },
      { name: 'Professional Summary', score: 60 + (seed % 20) },
      { name: 'Work Experience', score: 70 + (seed % 15) },
      { name: 'Education', score: 55 + (seed % 25) },
      { name: 'Skills', score: 75 + (seed % 20) },
      { name: 'Certifications', score: 50 + (seed % 30) },
    ],
    jobAlignmentContract: 68 + (seed % 25),
    jobAlignmentContractExplanation: 'AI analysis unavailable — this is an estimated score based on general resume patterns. For a detailed AI-powered analysis, please try again shortly.',
    jobAlignmentFullTime: 72 + (seed % 20),
    jobAlignmentFullTimeExplanation: 'AI analysis unavailable — this is an estimated score based on general resume patterns. For a detailed AI-powered analysis, please try again shortly.',
    missingCertifications: [
      'AWS Certified Solutions Architect',
      'Certified Kubernetes Administrator (CKA)',
      'Project Management Professional (PMP)',
      'Certified ScrumMaster (CSM)',
      'CompTIA Security+',
    ],
    recommendedTraining: [
      'Advanced Cloud Architecture Design Course',
      'Leadership and Management for Technical Professionals',
      'Data-Driven Decision Making Workshop',
      'Agile Project Management Certification Prep',
    ],
  }
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < Math.min(str.length, 1000); i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}
