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

      return true
    },

    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after sign in
      if (url.startsWith(baseUrl)) {
        // If there's a callbackUrl, use it
        if (url.includes('callbackUrl=')) {
          const callbackUrl = new URL(url).searchParams.get('callbackUrl')
          if (callbackUrl && callbackUrl.startsWith('/')) {
            return `${baseUrl}${callbackUrl}`
          }
        }
        // Default to dashboard
        return `${baseUrl}/dashboard`
      }
      // If the URL is just a path, redirect to dashboard
      if (url.startsWith('/')) {

    async redirect({ url, baseUrl }) {
      console.log('[NextAuth] Redirect called:', { url, baseUrl })
      
      // If url is a full URL and contains callbackUrl parameter
      if (url.includes('callbackUrl=')) {
        try {
          const urlObj = new URL(url)
          const callbackUrl = urlObj.searchParams.get('callbackUrl')
          
          if (callbackUrl) {
            // If callbackUrl is a relative path, prepend baseUrl
            if (callbackUrl.startsWith('/')) {
              const finalUrl = `${baseUrl}${callbackUrl}`
              console.log('[NextAuth] Redirecting to callbackUrl:', finalUrl)
              return finalUrl
            }
            // If callbackUrl is a full URL starting with baseUrl, use it
            if (callbackUrl.startsWith(baseUrl)) {
              console.log('[NextAuth] Redirecting to callbackUrl:', callbackUrl)
              return callbackUrl
            }
          }
        } catch (error) {
          console.error('[NextAuth] Error parsing callbackUrl:', error)
        }
      }
      
      // If url itself is a relative path (like /jobs/123)
      if (url.startsWith('/') && !url.startsWith('//')) {
        const finalUrl = `${baseUrl}${url}`
        console.log('[NextAuth] Redirecting to relative URL:', finalUrl)
        return finalUrl
      }
      
      // If url is a full URL within baseUrl
      if (url.startsWith(baseUrl)) {
        console.log('[NextAuth] Redirecting to:', url)
        return url
      }
      
      // Default fallback to dashboard
      console.log('[NextAuth] Fallback to dashboard')
      return `${baseUrl}/dashboard`
    },
            session.user.atsPremium = (token.atsPremium as boolean) || false
          }
        }
      } catch (error) {
        console.error("[NextAuth] session callback error:", error)
        if (session.user && token.sub) {
          session.user.id = token.sub
          session.user.role = "jobseeker"
          session.user.atsPremium = false
        }
      }

      return session
    },

    async jwt({ token, user }) {
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
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
}
