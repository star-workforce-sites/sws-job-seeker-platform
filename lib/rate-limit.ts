// Simple in-memory rate limiter (for serverless)
// For production scale, use Vercel KV or Upstash Redis

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per IP in window
}

const rateLimiters = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(config: RateLimitConfig) {
  return {
    check: async (identifier: string): Promise<{ success: boolean; remaining: number }> => {
      const now = Date.now()
      const windowStart = now - config.interval

      // Clean up old entries
      for (const [key, value] of rateLimiters.entries()) {
        if (value.resetTime < now) {
          rateLimiters.delete(key)
        }
      }

      const limit = rateLimiters.get(identifier)

      if (!limit) {
        rateLimiters.set(identifier, {
          count: 1,
          resetTime: now + config.interval,
        })
        return { success: true, remaining: config.uniqueTokenPerInterval - 1 }
      }

      if (limit.resetTime < now) {
        // Window expired, reset
        limit.count = 1
        limit.resetTime = now + config.interval
        return { success: true, remaining: config.uniqueTokenPerInterval - 1 }
      }

      if (limit.count >= config.uniqueTokenPerInterval) {
        return { success: false, remaining: 0 }
      }

      limit.count++
      return { success: true, remaining: config.uniqueTokenPerInterval - limit.count }
    },
  }
}

// Preset rate limiters
export const apiRateLimit = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 60, // 60 requests per minute per IP
})

export const authRateLimit = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 5, // 5 login attempts per 15 minutes
})

export const contactRateLimit = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 3, // 3 contact form submissions per hour
})
