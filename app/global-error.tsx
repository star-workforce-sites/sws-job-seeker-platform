"use client"

import { useEffect } from "react"
import { reportError } from "@/lib/monitoring"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportError(error, { digest: error.digest, type: "global" }, "critical")
  }, [error])

  return (
    <html>
      <body>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>Critical Error</h1>
          <p>Something went wrong with the application.</p>
          <button onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  )
}
