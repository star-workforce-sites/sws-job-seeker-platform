"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { reportError } from "@/lib/monitoring"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Report error to monitoring system
    reportError(error, { digest: error.digest, page: window.location.pathname }, "high")

    console.error("[v0] Application error caught by error boundary:", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    })
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground">
            We apologize for the inconvenience. Our team has been notified and is working on a fix.
          </p>
        </div>

        {typeof window !== "undefined" && window.location.hostname === "localhost" && (
          <div className="bg-muted p-4 rounded text-left">
            <p className="font-mono text-sm text-destructive break-all">{error.message}</p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Button onClick={() => (window.location.href = "/")} variant="outline">
            Go to homepage
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">Error ID: {error.digest || "N/A"}</p>
      </div>
    </div>
  )
}
