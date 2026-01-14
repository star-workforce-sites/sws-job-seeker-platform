import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Payment Cancelled - STAR Workforce Solutions",
  description: "Your payment was cancelled",
}

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow bg-slate-50 py-16 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-gray-400" />
              </div>
              <CardTitle className="font-heading text-2xl">Payment Cancelled</CardTitle>
              <CardDescription>Your payment was not completed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-gray-600">No charges were made to your account. You can try again anytime.</p>
              <div className="pt-4 space-y-2">
                <Link href="/tools/ats-optimizer">
                  <Button className="w-full bg-[#E8C547] hover:bg-[#d4b540] text-[#0A1A2F]">
                    Back to ATS Optimizer
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full bg-transparent">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
