import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthError({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const error = searchParams.error

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black/90 via-[#0A1A2F]/80 to-black/70 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#0A1A2F] mb-2">Authentication Error</h1>
        <p className="text-gray-600 mb-6">
          {error === "Configuration"
            ? "There is a problem with the server configuration."
            : error === "AccessDenied"
              ? "You do not have permission to sign in."
              : error === "Verification"
                ? "The verification token has expired or has already been used."
                : "An error occurred during authentication. Please try again."}
        </p>
        <Button asChild className="w-full">
          <Link href="/auth/login">Back to Login</Link>
        </Button>
      </div>
    </div>
  )
}
