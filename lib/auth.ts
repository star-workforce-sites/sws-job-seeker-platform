import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import CredentialsProvider from "next-auth/providers/credentials"

// Helper to safely check if database is available
function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

// Helper to safely get user data from database
async function safeGetUserByEmail(email: string) {
  if (!isDatabaseConfigured()) return null

  try {
    const { getUserByEmail } = await import("./db")
    return await getUserByEmail(email)
  } catch (error) {
    console.error("[NextAuth] Database query failed:", error)
    return null
  }
}

async function safeGetUserById(id: string) {
  if (!isDatabaseConfigured()) return null

  try {
    const { getUserById } = await import("./db")
    return await getUserById(id)
  } catch (error) {
    console.error("[NextAuth] Database query failed:", error)
    return null
  }
}

async function safeCreateUser(data: any) {
  if (!isDatabaseConfigured()) return null

  try {
    const { createUser } = await import("./db")
    return await createUser(data)
  } catch (error) {
    console.error("[NextAuth] Database insert failed:", error)
    return null
  }
}

console.log("[v0] NextAuth config loading - checking environment variables")
console.log("[v0] GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID)
console.log("[v0] LINKEDIN_CLIENT_ID exists:", !!process.env.LINKEDIN_CLIENT_ID)
console.log("[v0] NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET)
console.log("[v0] DATABASE_URL exists:", !!process.env.DATABASE_URL)

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TODO: Implement actual authentication logic
        // For now, this is a placeholder that won't crash NextAuth
        return null
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-secret",
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "dummy-secret",
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      console.log("[v0] SignIn callback triggered")
      if (!user.email) return false

      try {
        const existingUser = await safeGetUserByEmail(user.email)

        if (!existingUser && isDatabaseConfigured()) {
          await safeCreateUser({
            name: user.name || undefined,
            email: user.email,
            emailVerified: new Date(),
            role: "jobseeker",
          })
        }
      } catch (error) {
        console.error("[NextAuth] signIn callback error:", error)
      }

      // Always return true - JWT-only mode works without database
      return true
    },

    async session({ session, token }) {
      console.log("[v0] Session callback triggered")
      try {
        if (session.user && token.sub) {
          const dbUser = await safeGetUserById(token.sub)

          if (dbUser) {
            session.user.id = dbUser.id
            session.user.role = dbUser.role
            session.user.atsPremium = dbUser.atsPremium
          } else {
            // Fallback to JWT data
            session.user.id = token.sub
            session.user.role = (token.role as string) || "jobseeker"
            session.user.atsPremium = (token.atsPremium as boolean) || false
          }
        }
      } catch (error) {
        console.error("[NextAuth] session callback error:", error)
        // Ensure user data exists even on error
        if (session.user && token.sub) {
          session.user.id = token.sub
          session.user.role = "jobseeker"
          session.user.atsPremium = false
        }
      }

      return session
    },

    async jwt({ token, user }) {
      console.log("[v0] JWT callback triggered")
      try {
        if (user) {
          token.sub = user.id

          if (user.email) {
            const dbUser = await safeGetUserByEmail(user.email)
            if (dbUser) {
              token.role = dbUser.role
              token.atsPremium = dbUser.atsPremium
            } else {
              token.role = "jobseeker"
              token.atsPremium = false
            }
          } else {
            token.role = "jobseeker"
            token.atsPremium = false
          }
        }
      } catch (error) {
        console.error("[NextAuth] JWT callback error:", error)
        // Set safe defaults
        if (user && !token.role) {
          token.role = "jobseeker"
          token.atsPremium = false
        }
      }

      return token
    },
  },

  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
    newUser: "/dashboard",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",

  trustHost: true, // Trust the host header from Vercel

  debug: true, // Enable debug mode to see what's crashing
}

console.log("[v0] NextAuth config successfully created")
