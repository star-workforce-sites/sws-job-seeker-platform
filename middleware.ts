import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const BAD_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "Bytespider",
  "OmnaiBot",
  "SemrushBot",
  "AhrefsBot",
  "Dotbot",
  "MJ12bot",
  "PetalBot",
]

const GOOD_BOTS = [
  "Googlebot",
  "Bingbot",
  "Slurp",
  "DuckDuckBot",
  "Baiduspider",
  "facebookexternalhit",
  "LinkedInBot",
  "TwitterBot",
  "WhatsApp",
]

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase()

  // Allow good bots
  if (GOOD_BOTS.some((bot) => ua.includes(bot.toLowerCase()))) {
    return false
  }

  // Block bad bots - exact match from robots.txt
  if (BAD_BOTS.some((bot) => ua.includes(bot.toLowerCase()))) {
    return true
  }

  return false
}

function isSuspiciousTraffic(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent") || ""

  // No user agent or very short
  if (!userAgent || userAgent.length < 10) {
    return true
  }

  // Check for bot
  if (isBot(userAgent)) {
    return true
  }

  const hasAcceptLanguage = request.headers.has("accept-language")
  const hasAccept = request.headers.has("accept")
  const hasReferer = request.headers.has("referer")

  // Block only if missing ALL common headers
  if (!hasAcceptLanguage && !hasAccept && !hasReferer) {
    return true
  }

  return false
}

export function middleware(request: NextRequest) {
  const startTime = Date.now()

  const hostname = request.headers.get("host") || ""
  const url = request.nextUrl.clone()

  // Redirect starworkforcesolutions.com → www.starworkforcesolutions.com
  if (hostname === "starworkforcesolutions.com") {
    url.host = "www.starworkforcesolutions.com"
    console.log("[WWW REDIRECT]", {
      from: hostname,
      to: "www.starworkforcesolutions.com",
      path: url.pathname,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.redirect(url, 301) // Permanent redirect
  }

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = request.ip || request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous"

    // Simple rate limit check (60 requests per minute per IP)
    // For production, consider using Vercel KV or Upstash Redis
    const rateLimitKey = `ratelimit:${ip}`

    // Note: This is a basic implementation. For production scale,
    // use a distributed rate limiter like Vercel KV
  }

  if (isSuspiciousTraffic(request)) {
    console.log("[BOT BLOCKED]", {
      userAgent: request.headers.get("user-agent"),
      url: request.url,
      timestamp: new Date().toISOString(),
    })

    // Return 403 Forbidden for bots
    return new NextResponse("Forbidden", { status: 403 })
  }

  // Log request (Vercel will capture this)
  console.log("[REQUEST]", {
    method: request.method,
    url: request.url,
    timestamp: new Date().toISOString(),
  })

  // Add security headers
  const response = NextResponse.next()

  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Log response time
  const duration = Date.now() - startTime
  console.log("[RESPONSE]", {
    method: request.method,
    url: request.url,
    duration,
    status: response.status,
    timestamp: new Date().toISOString(),
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
