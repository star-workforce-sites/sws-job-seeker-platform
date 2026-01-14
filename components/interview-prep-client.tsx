"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { ClipboardList, CheckCircle, XCircle, Award, RefreshCw } from "lucide-react"

type Question = {
  id: string
  skill: string
  topic: string
  difficulty: string
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
}

type Result = {
  questionId: string
  isCorrect: boolean
  correctAnswer: string
  explanation: string
}

export default function InterviewPrepClient() {
  const [step, setStep] = useState<"input" | "quiz" | "results">("input")
  const [jobDescription, setJobDescription] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<{
    score: number
    total: number
    percentage: string
    details: Result[]
  } | null>(null)

  const handleStart = async () => {
    if (!jobDescription.trim() || !email.trim()) {
      alert("Please provide both job description and email")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/interview-prep-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSessionId(data.sessionId)
        setSkills(data.skills)
        setQuestions(data.questions)
        setStep("quiz")
      } else {
        alert(data.error || "Failed to start interview prep")
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (option: string) => {
    setUserAnswers({ ...userAnswers, [questions[currentQuestionIndex].id]: option })
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    const answers = questions.map((q) => ({
      questionId: q.id,
      userAnswer: userAnswers[q.id] || "",
    }))

    setLoading(true)
    try {
      const response = await fetch("/api/interview-prep-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers }),
      })

      const data = await response.json()

      if (response.ok) {
        setResults({
          score: data.score,
          total: data.total,
          percentage: data.percentage,
          details: data.results,
        })
        setStep("results")
      } else {
        alert(data.error || "Failed to submit answers")
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep("input")
    setJobDescription("")
    setEmail("")
    setSessionId("")
    setSkills([])
    setQuestions([])
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setResults(null)
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="abstract-gradient text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <ClipboardList className="w-16 h-16 text-[#E8C547]" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 premium-heading">Interview Prep</h1>
          <p className="text-lg text-white/90 premium-body">
            Practice unlimited interview questions based on your target job. Test your knowledge and get instant
            feedback.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Input Step */}
          {step === "input" && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground premium-heading">Start Your Interview Practice</h2>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-base font-semibold premium-heading">
                    Your Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="job-description" className="text-base font-semibold premium-heading">
                    Paste Job Description
                  </Label>
                  <Textarea
                    id="job-description"
                    placeholder="Paste the job description here. We'll analyze it and generate relevant interview questions based on required skills..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={10}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    The more detailed the job description, the better we can match questions to your target role.
                  </p>
                </div>

                <Button
                  onClick={handleStart}
                  disabled={loading}
                  className="w-full bg-[#0A1A2F] hover:bg-[#132A47] text-[#E8C547] font-bold text-lg py-6"
                  size="lg"
                >
                  {loading ? "Analyzing..." : "Start Interview Practice"}
                </Button>

                <div className="bg-[#E8C547]/10 border border-[#E8C547] rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2 premium-heading">What You'll Get:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground premium-body">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#E8C547] flex-shrink-0 mt-0.5" />
                      <span>10 multiple-choice questions tailored to the job description</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#E8C547] flex-shrink-0 mt-0.5" />
                      <span>Instant scoring and feedback with correct answers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#E8C547] flex-shrink-0 mt-0.5" />
                      <span>Unlimited practice sessions - test yourself as many times as you want</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#E8C547] flex-shrink-0 mt-0.5" />
                      <span>100% FREE - No credit card required</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Quiz Step */}
          {step === "quiz" && currentQuestion && (
            <div className="space-y-6">
              {/* Progress Bar */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-[#E8C547]/20 text-[#0A1A2F] text-xs font-medium rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-[#0A1A2F]">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </Card>

              {/* Question Card */}
              <Card className="p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-[#0A1A2F] text-[#E8C547] text-sm font-semibold rounded">
                      {currentQuestion.skill}
                    </span>
                    <span className="px-3 py-1 bg-muted text-muted-foreground text-sm font-medium rounded">
                      {currentQuestion.topic}
                    </span>
                    <span className="px-3 py-1 bg-muted text-muted-foreground text-sm font-medium rounded capitalize">
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground premium-heading">{currentQuestion.question}</h3>
                </div>

                <div className="space-y-3">
                  {Object.entries(currentQuestion.options).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => handleAnswer(key)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        userAnswers[currentQuestion.id] === key
                          ? "border-[#E8C547] bg-[#E8C547]/10"
                          : "border-border hover:border-[#E8C547]/50 bg-background"
                      }`}
                    >
                      <span className="font-semibold text-[#0A1A2F]">{key}.</span>{" "}
                      <span className="text-foreground">{value}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  Previous
                </Button>
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button onClick={handleNext} className="flex-1 bg-[#0A1A2F] hover:bg-[#132A47] text-[#E8C547]">
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || Object.keys(userAnswers).length < questions.length}
                    className="flex-1 bg-[#E8C547] hover:bg-[#E8C547]/90 text-[#0A1A2F] font-bold"
                  >
                    {loading ? "Submitting..." : "Submit & See Results"}
                  </Button>
                )}
              </div>

              {Object.keys(userAnswers).length < questions.length && (
                <p className="text-center text-sm text-muted-foreground">
                  Answer all questions to submit ({Object.keys(userAnswers).length}/{questions.length} answered)
                </p>
              )}
            </div>
          )}

          {/* Results Step */}
          {step === "results" && results && (
            <div className="space-y-6">
              {/* Score Card */}
              <Card className="p-8 text-center bg-gradient-to-br from-[#0A1A2F] to-[#132A47] text-white">
                <Award className="w-16 h-16 mx-auto mb-4 text-[#E8C547]" />
                <h2 className="text-3xl font-bold mb-2 premium-heading">Your Score</h2>
                <div className="text-6xl font-bold mb-4 text-[#E8C547]">{results.percentage}%</div>
                <p className="text-xl">
                  {results.score} out of {results.total} correct
                </p>
              </Card>

              {/* Detailed Results */}
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-foreground premium-heading">Question Breakdown</h3>
                <div className="space-y-4">
                  {questions.map((question, index) => {
                    const result = results.details.find((r) => r.questionId === question.id)
                    if (!result) return null

                    return (
                      <div
                        key={question.id}
                        className={`p-4 rounded-lg border-2 ${
                          result.isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {result.isCorrect ? (
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-foreground mb-2">
                              {index + 1}. {question.question}
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                              Your answer: <span className="font-semibold">{userAnswers[question.id]}</span>
                              {!result.isCorrect && (
                                <>
                                  {" "}
                                  | Correct answer:{" "}
                                  <span className="font-semibold text-green-700">{result.correctAnswer}</span>
                                </>
                              )}
                            </p>
                            {result.explanation && (
                              <p className="text-sm text-muted-foreground italic">{result.explanation}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Try Again Button */}
              <Button
                onClick={handleReset}
                className="w-full bg-[#0A1A2F] hover:bg-[#132A47] text-[#E8C547] font-bold text-lg py-6"
                size="lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Practice Again with Different Job
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
