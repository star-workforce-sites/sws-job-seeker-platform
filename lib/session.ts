import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"

// Server-side session utilities

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function requireRole(role: "jobseeker" | "employer" | "admin") {
  const user = await requireAuth()
  if (user.role !== role && user.role !== "admin") {
    throw new Error("Forbidden")
  }
  return user
}
