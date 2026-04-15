import { type NextRequest, NextResponse } from "next/server"
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ── Rate limiter: 2 submissions per IP per hour ───────────────────────────────
const WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS = 2
const ipLog = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (ipLog.get(ip) || []).filter(t => now - t < WINDOW_MS)
  if (timestamps.length >= MAX_REQUESTS) return true
  timestamps.push(now)
  ipLog.set(ip, timestamps)
  return false
}

// ── Minimum time a real human takes to fill a form (5 seconds) ───────────────
const MIN_ELAPSED_MS = 5_000

// ── Disposable / spam email domains blocklist ─────────────────────────────────
const BLOCKED_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','tempmail.com','throwam.com','sharklasers.com',
  'guerrillamailblock.com','grr.la','guerrillamail.info','guerrillamail.biz','guerrillamail.de',
  'guerrillamail.net','guerrillamail.org','spam4.me','trashmail.com','trashmail.me',
  'trashmail.net','dispostable.com','yopmail.com','yopmail.fr','cool.fr.nf','jetable.fr.nf',
  'nospam.ze.tc','nomail.xl.cx','mega.zik.dj','speed.1s.fr','courriel.fr.nf','moncourrier.fr.nf',
  'monemail.fr.nf','monmail.fr.nf','10minutemail.com','10minutemail.net','10minutemail.org',
  'tempinbox.com','fakeinbox.com','mailnull.com','spamgourmet.com','spamgourmet.net',
  'spamgourmet.org','spamhole.com','spaml.com','spamtrap.ro','dumpmail.de',
  'discard.email','maildrop.cc','mailnesia.com','mailnull.com','nospamfor.us',
  'anonaddy.com','simplelogin.io',
])

function isBlockedEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return domain ? BLOCKED_DOMAINS.has(domain) : false
}

// ── Content-based spam detector ───────────────────────────────────────────────
const SPAM_PATTERNS: RegExp[] = [
  // SEO / link building spam
  /\bseo\b.*\b(service|rank|traffic|backlink|link.?build)/i,
  /\bbacklink/i,
  /\b(buy|cheap|best|discount).*(traffic|clicks|leads|visitors)/i,
  /\bguaranteed (first page|top rank|#1)/i,
  /\bpage (one|1) (google|ranking)/i,
  // Pharma / adult spam
  /\b(viagra|cialis|levitra|pharmacy|casino|poker|slot)\b/i,
  // Crypto spam
  /\b(bitcoin|crypto|nft|blockchain).{0,30}(invest|earn|profit|opportunity)/i,
  // Generic marketing spam
  /\b(make money|work from home|passive income|mlm|pyramid)\b/i,
  /\bclick here\b.*\bhttp/i,
]

const URL_PATTERN = /https?:\/\/[^\s]+/g

function isSpamContent(text: string): boolean {
  // Block if more than 2 URLs
  const urls = text.match(URL_PATTERN) || []
  if (urls.length > 2) return true
  // Block obvious spam keyword patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) return true
  }
  return false
}

// ── Bot User-Agent patterns ───────────────────────────────────────────────────
const BOT_UA_PATTERNS = [
  /curl\//i, /wget\//i, /python-requests\//i, /axios\//i, /java\//i,
  /libwww-perl/i, /lwp-trivial/i, /scrapy/i, /bot/i, /crawler/i, /spider/i,
]

function isBotUserAgent(ua: string): boolean {
  if (!ua || ua.length < 10) return true // No UA = bot
  return BOT_UA_PATTERNS.some(p => p.test(ua))
}

// ── Subject allowlist ─────────────────────────────────────────────────────────
const VALID_SUBJECTS = new Set([
  'general','ats-optimizer','cover-letter','resume-distribution',
  'hire-recruiter-basic','hire-recruiter-standard','hire-recruiter-pro',
  'interview-prep','job-search','employer-services','billing',
  'technical-support','partnership','feedback',
])

const SILENT_OK = NextResponse.json({ success: true, message: "Message sent successfully!" }, { status: 200 })

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      name, email, subject, message,
      submittedAt,
      _hp,          // honeypot 1 (website field)
      _confirm,     // honeypot 2 (confirm email field)
      _elapsed,     // ms since form loaded
      _token,       // JS-generated presence token (bots without JS omit this)
    } = data

    // ── Gate 1: JS presence token (only browsers that ran our JS have this) ──
    if (!_token || typeof _token !== 'string' || _token.length < 8) {
      console.log("[Contact] Missing JS token — likely headless bot")
      return SILENT_OK
    }

    // ── Gate 2: Honeypot fields ────────────────────────────────────────────────
    if ((_hp && _hp.trim().length > 0) || (_confirm && _confirm.trim().length > 0)) {
      console.log("[Contact] Honeypot triggered")
      return SILENT_OK
    }

    // ── Gate 3: Timing check (< 5s is almost certainly a bot) ─────────────────
    if (typeof _elapsed === 'number' && _elapsed < MIN_ELAPSED_MS) {
      console.log("[Contact] Submission too fast:", _elapsed, "ms")
      return SILENT_OK
    }

    // ── Gate 4: User-Agent check ───────────────────────────────────────────────
    const ua = request.headers.get('user-agent') || ''
    if (isBotUserAgent(ua)) {
      console.log("[Contact] Bot UA detected:", ua.slice(0, 60))
      return SILENT_OK
    }

    // ── Gate 5: IP rate limit ──────────────────────────────────────────────────
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (isRateLimited(clientIp)) {
      console.log("[Contact] Rate limit exceeded for IP:", clientIp)
      return NextResponse.json(
        { success: false, message: "Too many submissions. Please try again later." },
        { status: 429 }
      )
    }

    // ── Gate 6: Field validation ───────────────────────────────────────────────
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // ── Gate 7: Subject allowlist ──────────────────────────────────────────────
    if (!VALID_SUBJECTS.has(subject)) {
      console.log("[Contact] Invalid subject:", subject)
      return SILENT_OK
    }

    // ── Gate 8: Blocked / disposable email domains ────────────────────────────
    if (isBlockedEmail(email)) {
      console.log("[Contact] Blocked email domain:", email)
      return SILENT_OK
    }

    // ── Gate 9: Content spam detection ────────────────────────────────────────
    const combined = `${name} ${email} ${message}`
    if (isSpamContent(combined)) {
      console.log("[Contact] Spam content detected from:", email)
      return SILENT_OK
    }

    // ── Gate 10: Reasonable field lengths ─────────────────────────────────────
    if (name.length > 100 || email.length > 200 || message.length > 5000) {
      console.log("[Contact] Field length exceeded from:", email)
      return SILENT_OK
    }

    console.log("[Contact] Legitimate submission from:", email, "subject:", subject)

    // ── Format subject label ───────────────────────────────────────────────────
    const subjectLabels: Record<string, string> = {
      'general': 'General Inquiry',
      'ats-optimizer': 'ATS Optimizer',
      'cover-letter': 'Cover Letter Generator',
      'resume-distribution': 'Resume Distribution Service',
      'hire-recruiter-basic': 'Hire Recruiter - Basic Plan',
      'hire-recruiter-standard': 'Hire Recruiter - Standard Plan',
      'hire-recruiter-pro': 'Hire Recruiter - Pro Plan',
      'interview-prep': 'Interview Preparation',
      'job-search': 'Job Search Assistance',
      'employer-services': 'Employer/Recruiting Services',
      'billing': 'Billing & Payments',
      'technical-support': 'Technical Support',
      'partnership': 'Partnership Opportunities',
      'feedback': 'Feedback & Suggestions',
    }

    const subjectLabel = subjectLabels[subject] || subject

    // ── Send email ─────────────────────────────────────────────────────────────
    const { data: emailData, error } = await resend.emails.send({
      from: 'STAR Workforce Contact <info@starworkforcesolutions.com>',
      to: ['info@starworkforcesolutions.com', 'info@startekk.net', 'Srikanth@startekk.net'],
      replyTo: email,
      subject: `[Contact Form] ${subjectLabel} - from ${name}`,
      html: `
        <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f4f4f4;">
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A1A2F; padding: 20px; text-align: center;">
            <h1 style="color: #E8C547; margin: 0;">STAR Workforce Solutions</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #0A1A2F; border-bottom: 2px solid #E8C547; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            <table style="width: 100%; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Name:</td>
                <td style="padding: 8px 0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Subject:</td>
                <td style="padding: 8px 0;">${subjectLabel}</td>
              </tr>
            </table>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <h3 style="color: #0A1A2F; margin-top: 0;">Message:</h3>
              <p style="white-space: pre-wrap; color: #333;">${message}</p>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              Submitted at: ${submittedAt || new Date().toISOString()}
            </p>
          </div>
        </div>
        </body></html>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subjectLabel}

Message:
${message}

Submitted at: ${submittedAt || new Date().toISOString()}
      `,
    })

    if (error) {
      console.error("[Contact] Resend error:", error)
      return NextResponse.json(
        { success: true, message: "Your message was received. If you don't hear back within 48 hours, please email info@starworkforcesolutions.com directly." },
        { status: 200 }
      )
    }

    console.log("[Contact] Email sent successfully:", emailData)

    return NextResponse.json(
      { success: true, message: "Message sent successfully! We'll respond within 24 hours." },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("[Contact] Error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to send message. Please email info@starworkforcesolutions.com directly." },
      { status: 500 }
    )
  }
}
