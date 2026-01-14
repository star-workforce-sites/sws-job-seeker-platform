"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const cookieConsent = localStorage.getItem("cookie-consent")
    if (!cookieConsent) {
      setShowBanner(true)
    } else if (cookieConsent === "accepted") {
      enableGoogleAnalytics()
    } else {
      disableGoogleAnalytics()
    }
  }, [])

  const enableGoogleAnalytics = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("consent", "update", {
        analytics_storage: "granted",
      })
    }
  }

  const disableGoogleAnalytics = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("consent", "update", {
        analytics_storage: "denied",
      })
    }
  }

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted")
    enableGoogleAnalytics()
    setShowBanner(false)
  }

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected")
    disableGoogleAnalytics()
    setShowBanner(false)
  }

  if (!isClient || !showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground p-4 sm:p-6 shadow-lg z-50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm sm:text-base premium-body">
            We use cookies and analytics to improve your experience. By continuing, you agree to our use of cookies.{" "}
            <a href="/legal/privacy" className="text-accent underline hover:text-accent/80">
              Learn more
            </a>
          </p>
        </div>
        <div className="flex gap-3 whitespace-nowrap">
          <Button
            onClick={handleReject}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            Do Not Accept
          </Button>
          <Button onClick={handleAccept} className="bg-accent hover:bg-accent/90 text-primary">
            Accept Cookies
          </Button>
        </div>
      </div>
    </div>
  )
}
