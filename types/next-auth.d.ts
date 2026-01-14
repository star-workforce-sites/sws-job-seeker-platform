import "next-auth"
import type { DefaultSession } from "next-auth"

// Extend NextAuth types to include custom user fields

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "jobseeker" | "employer" | "employer-pending" | "admin"
      atsPremium: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role?: string
    atsPremium?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string
    role?: string
    atsPremium?: boolean
  }
}
