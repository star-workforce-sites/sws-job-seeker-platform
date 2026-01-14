import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MailCheck } from "lucide-react"

export const metadata = {
  title: "Check Your Email - STAR Workforce Solutions",
  description: "A magic link has been sent to your email address",
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow bg-slate-50 py-16 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <MailCheck className="h-16 w-16 text-[#E8C547]" />
              </div>
              <CardTitle className="font-heading text-2xl">Check Your Email</CardTitle>
              <CardDescription>We've sent you a magic link to sign in</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Click the link in your email to sign in to your account. The link will expire in 24 hours.
              </p>
              <p className="text-sm text-gray-500">
                Didn't receive an email? Check your spam folder or try signing in again.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
