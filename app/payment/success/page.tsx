"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(true)
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    // Set cookie for client-side ATS premium access
    if (sessionId) {
      document.cookie = `atsPremium=true; path=/; max-age=${365 * 24 * 60 * 60}; secure; samesite=strict`
      setTimeout(() => setIsVerifying(false), 1500)
    }
  }, [sessionId])

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8C547] mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying your payment...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow bg-slate-50 py-16 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="font-heading text-2xl">Payment Successful!</CardTitle>
              <CardDescription>Your purchase has been completed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-gray-600">
                Thank you for your purchase. You now have full access to premium features.
              </p>
              <div className="pt-4 space-y-2">
                <Button
                  onClick={() => router.push("/tools/ats-optimizer")}
                  className="w-full bg-[#E8C547] hover:bg-[#d4b540] text-[#0A1A2F]"
                >
                  Go to ATS Optimizer
                </Button>
                <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full">
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
