"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Phone,
  Linkedin,
  MapPin,
  Briefcase,
  Tag,
  FileText,
  Award,
  ChevronRight,
  Plus,
  X,
  Check,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

// ─── Types ───────────────────────────────────────────────────────
interface UserProfile {
  phone: string | null
  linkedin_url: string | null
  location: string | null
  work_auth: string | null
  target_titles: string[] | null
  target_locations: string[] | null
  open_to_remote: boolean
  open_to_contract: boolean
  open_to_fulltime: boolean
  min_rate_hourly: number | null
  skills: string[] | null
  resume_text: string | null
  certifications: string[] | null
}

interface UserBase {
  name: string
  email: string
}

const WORK_AUTH_OPTIONS = [
  { value: "us_citizen",    label: "US Citizen" },
  { value: "green_card",    label: "Green Card / PR" },
  { value: "h1b",           label: "H1B Visa" },
  { value: "h1b_transfer",  label: "H1B Transfer" },
  { value: "stem_opt",      label: "STEM OPT" },
  { value: "opt",           label: "OPT" },
  { value: "ead",           label: "EAD" },
  { value: "tn_visa",       label: "TN Visa" },
  { value: "other",         label: "Other" },
]

// ─── Tag Input ────────────────────────────────────────────────────
function TagInput({
  label,
  placeholder,
  tags,
  onChange,
}: {
  label: string
  placeholder: string
  tags: string[]
  onChange: (tags: string[]) => void
}) {
  const [input, setInput] = useState("")

  function addTag() {
    const val = input.trim()
    if (val && !tags.includes(val)) {
      onChange([...tags, val])
    }
    setInput("")
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <div className="flex gap-2 mb-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              addTag()
            }
          }}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag} className="shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 pr-1 text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-full hover:bg-muted p-0.5 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────
function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground premium-heading">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  )
}

// ─── Profile Completion Bar ───────────────────────────────────────
function ProfileCompletion({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-400"
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-foreground">Profile Completeness</span>
        <span className="text-sm font-semibold text-foreground">{score}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {score < 100 && (
        <p className="text-xs text-muted-foreground mt-1">
          Complete your profile so your recruiter can find the best matches for you.
        </p>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [user, setUser] = useState<UserBase>({ name: "", email: "" })
  const [profile, setProfile] = useState<UserProfile>({
    phone: null,
    linkedin_url: null,
    location: null,
    work_auth: null,
    target_titles: [],
    target_locations: [],
    open_to_remote: true,
    open_to_contract: true,
    open_to_fulltime: false,
    min_rate_hourly: null,
    skills: [],
    resume_text: null,
    certifications: [],
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Auth guard
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/dashboard/job-seeker/profile")
    }
  }, [status, router])

  // ── Load profile
  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then(({ user: u, profile: p }) => {
        setUser({ name: u.name ?? "", email: u.email })
        if (p) {
          setProfile({
            phone: p.phone ?? null,
            linkedin_url: p.linkedin_url ?? null,
            location: p.location ?? null,
            work_auth: p.work_auth ?? null,
            target_titles: p.target_titles ?? [],
            target_locations: p.target_locations ?? [],
            open_to_remote: p.open_to_remote ?? true,
            open_to_contract: p.open_to_contract ?? true,
            open_to_fulltime: p.open_to_fulltime ?? false,
            min_rate_hourly: p.min_rate_hourly ?? null,
            skills: p.skills ?? [],
            resume_text: p.resume_text ?? null,
            certifications: p.certifications ?? [],
          })
        }
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false))
  }, [status])

  // ── Completeness score
  const completionScore = useCallback(() => {
    const checks = [
      !!user.name,
      !!profile.phone,
      !!profile.linkedin_url,
      !!profile.location,
      !!profile.work_auth,
      (profile.skills ?? []).length > 0,
      (profile.target_titles ?? []).length > 0,
      (profile.target_locations ?? []).length > 0,
      !!profile.resume_text,
    ]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [user, profile])

  // ── Save
  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user.name, ...profile }),
      })
      if (!res.ok) throw new Error("Save failed")
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const score = completionScore()

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 py-8 w-full">
        {/* Back link */}
        <Link
          href="/dashboard/job-seeker"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground premium-heading">My Profile</h1>
            <p className="text-sm text-muted-foreground premium-body mt-0.5">
              {session?.user?.email}
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#0A1A2F] hover:bg-[#132A47] text-white font-semibold min-w-[120px]"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
            ) : saved ? (
              <><Check className="w-4 h-4 mr-2 text-green-400" /> Saved!</>
            ) : (
              "Save Profile"
            )}
          </Button>
        </div>

        <ProfileCompletion score={score} />

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="space-y-6">

          {/* ── Contact Info ─────────────────────────────── */}
          <Section icon={User} title="Contact Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                <Input
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </span>
                </label>
                <Input
                  value={profile.phone ?? ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value || null })}
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn URL
                  </span>
                </label>
                <Input
                  value={profile.linkedin_url ?? ""}
                  onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value || null })}
                  placeholder="https://linkedin.com/in/janesmit"
                  type="url"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Current Location
                  </span>
                </label>
                <Input
                  value={profile.location ?? ""}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value || null })}
                  placeholder="Dallas, TX"
                />
              </div>
            </div>
          </Section>

          {/* ── Work Authorization ───────────────────────── */}
          <Section icon={Briefcase} title="Work Authorization">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Work Authorization Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {WORK_AUTH_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setProfile({
                        ...profile,
                        work_auth: profile.work_auth === opt.value ? null : opt.value,
                      })
                    }
                    className={`text-sm px-3 py-2 rounded-lg border text-left transition-all ${
                      profile.work_auth === opt.value
                        ? "bg-[#0A1A2F] border-[#0A1A2F] text-white font-medium"
                        : "border-border text-foreground hover:border-[#0A1A2F]/50 hover:bg-muted/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Open to</label>
                <div className="space-y-2">
                  {[
                    { key: "open_to_remote" as const,   label: "Remote" },
                    { key: "open_to_contract" as const, label: "Contract / Consulting" },
                    { key: "open_to_fulltime" as const, label: "Full-time (W2)" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={profile[key]}
                        onChange={(e) => setProfile({ ...profile, [key]: e.target.checked })}
                        className="w-4 h-4 rounded border-border accent-[#0A1A2F]"
                      />
                      <span className="text-sm text-foreground group-hover:text-foreground/80">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Minimum Rate ($/hr)
                </label>
                <Input
                  value={profile.min_rate_hourly ?? ""}
                  onChange={(e) => {
                    const val = e.target.value
                    setProfile({
                      ...profile,
                      min_rate_hourly: val ? parseInt(val, 10) : null,
                    })
                  }}
                  placeholder="e.g. 65"
                  type="number"
                  min={0}
                  max={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Helps your recruiter filter out roles below your floor
                </p>
              </div>
            </div>
          </Section>

          {/* ── Job Preferences ──────────────────────────── */}
          <Section icon={Briefcase} title="Job Preferences">
            <TagInput
              label="Target Job Titles"
              placeholder="e.g. Java Developer, Data Engineer"
              tags={profile.target_titles ?? []}
              onChange={(tags) => setProfile({ ...profile, target_titles: tags })}
            />
            <TagInput
              label="Target Locations"
              placeholder="e.g. Remote, Dallas TX, New York NY"
              tags={profile.target_locations ?? []}
              onChange={(tags) => setProfile({ ...profile, target_locations: tags })}
            />
          </Section>

          {/* ── Skills ───────────────────────────────────── */}
          <Section icon={Tag} title="Skills">
            <TagInput
              label="Technical & Professional Skills"
              placeholder="e.g. React, Python, AWS, Agile"
              tags={profile.skills ?? []}
              onChange={(tags) => setProfile({ ...profile, skills: tags })}
            />
            <p className="text-xs text-muted-foreground">
              Press Enter or comma to add a skill. These help your recruiter target the right roles.
            </p>
          </Section>

          {/* ── Certifications ───────────────────────────── */}
          <Section icon={Award} title="Certifications">
            <TagInput
              label="Certifications & Credentials"
              placeholder="e.g. AWS Solutions Architect, PMP, CISSP"
              tags={profile.certifications ?? []}
              onChange={(tags) => setProfile({ ...profile, certifications: tags })}
            />

            {/* CTA to ATS optimizer */}
            <Link href="/tools/ats-optimizer">
              <div className="mt-4 flex items-center justify-between bg-muted/40 border border-border rounded-lg px-4 py-3 hover:bg-muted/60 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Score Your Resume</p>
                    <p className="text-xs text-muted-foreground">
                      Use our free ATS Optimizer to check your resume against any job description
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </Link>
          </Section>

          {/* ── Resume Text ──────────────────────────────── */}
          <Section icon={FileText} title="Resume (Text Copy)">
            <p className="text-sm text-muted-foreground">
              Paste your resume text below. Your recruiter uses this to tailor applications and find
              the best-fit roles for your background.
            </p>
            <Textarea
              value={profile.resume_text ?? ""}
              onChange={(e) => setProfile({ ...profile, resume_text: e.target.value || null })}
              placeholder="Paste your full resume text here..."
              rows={14}
              className="font-mono text-xs resize-y"
            />
            <p className="text-xs text-muted-foreground">
              This is stored securely and only visible to you and your assigned recruiter.
            </p>
          </Section>

        </div>

        {/* ── Save button (bottom) ─────────────────────────── */}
        <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
          <Link
            href="/dashboard/job-seeker"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            ← Back to Dashboard
          </Link>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#0A1A2F] hover:bg-[#132A47] text-white font-semibold px-8"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
            ) : saved ? (
              <><Check className="w-4 h-4 mr-2 text-green-400" /> Saved!</>
            ) : (
              "Save Profile"
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
