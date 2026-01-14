// Vercel Monitoring & Error Reporting Utilities for STAR Workforce Solutions

export interface ErrorReport {
  message: string
  stack?: string
  context?: Record<string, any>
  userId?: string
  timestamp: string
  severity: "low" | "medium" | "high" | "critical"
}

export function reportError(
  error: Error,
  context?: Record<string, any>,
  severity: "low" | "medium" | "high" | "critical" = "medium",
) {
  const errorReport: ErrorReport = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    severity,
  }

  // Log to console (Vercel automatically captures console.error)
  console.error("[ERROR REPORT]", JSON.stringify(errorReport, null, 2))

  // Vercel automatically captures errors via console.error in all environments

  return errorReport
}

export function trackPerformance(metricName: string, duration: number, metadata?: Record<string, any>) {
  console.log("[PERFORMANCE]", {
    metric: metricName,
    duration,
    metadata,
    timestamp: new Date().toISOString(),
  })
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  console.log("[EVENT]", {
    event: eventName,
    properties,
    timestamp: new Date().toISOString(),
  })

  // Send to analytics if configured
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, properties)
  }
}
