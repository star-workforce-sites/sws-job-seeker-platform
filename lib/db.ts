import { sql } from "@vercel/postgres"
import process from "process"

// Database utility functions for STAR Workforce Solutions
// Uses Vercel Postgres with connection pooling

/**
 * Returns the database connection URL, checking DATABASE_URL first
 * then falling back to POSTGRES_URL. Use this everywhere instead of
 * directly referencing process.env.DATABASE_URL.
 */
export function getDbUrl(): string {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error("No database URL configured (DATABASE_URL or POSTGRES_URL)")
  return url
}

export interface User {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  role: "jobseeker" | "employer" | "employer-pending" | "admin" | "recruiter" | "partner"
  atsPremium: boolean
  createdAt: Date
}

export interface Job {
  id: string
  employerId: string
  title: string
  description: string
  location: string
  industry: string
  employmentType: "consulting" | "contract"
  visa: string | null
  salaryMin: number | null
  salaryMax: number | null
  expiresAt: Date
  createdAt: Date
  isActive: boolean
}

export interface Payment {
  id: string
  userId: string
  stripeSessionId: string
  amount: number
  product: string
  createdAt: Date
}

export interface Resume {
  id: string
  userId: string
  fileUrl: string
  createdAt: Date
}

// User queries
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      console.warn("[v0] Database not configured - getUserByEmail skipped")
      return null
    }

    const result = await sql<User>`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("[v0] Error fetching user by email:", error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      console.warn("[v0] Database not configured - getUserById skipped")
      return null
    }

    const result = await sql<User>`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("[v0] Error fetching user by ID:", error)
    return null
  }
}

export async function createUser(data: {
  name?: string
  email: string
  emailVerified?: Date
  role?: string
}): Promise<User | null> {
  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      console.warn("[v0] Database not configured - createUser skipped")
      return null
    }

    const result = await sql<User>`
      INSERT INTO users (name, email, "emailVerified", role)
      VALUES (${data.name || null}, ${data.email}, ${data.emailVerified ? data.emailVerified.toISOString() : null}, ${data.role || "jobseeker"})
      RETURNING *
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("[v0] Error creating user:", error)
    return null
  }
}

export async function updateUserAtsPremium(userId: string, isPremium: boolean): Promise<boolean> {
  try {
    await sql`
      UPDATE users SET "atsPremium" = ${isPremium} WHERE id = ${userId}
    `
    return true
  } catch (error) {
    console.error("[v0] Error updating ATS premium status:", error)
    return false
  }
}

// Job queries
export async function getActiveJobs(filters?: {
  industry?: string
  location?: string
  employmentType?: string
}): Promise<Job[]> {
  try {
    const hasIndustry = Boolean(filters?.industry)
    const hasLocation = Boolean(filters?.location)
    const hasEmploymentType = Boolean(filters?.employmentType)

    let result: { rows: Job[] }

    if (hasIndustry && hasLocation && hasEmploymentType) {
      result = await sql<Job>`
        SELECT * FROM jobs
        WHERE "isActive" = TRUE AND "expiresAt" > NOW()
        AND industry = ${filters!.industry}
        AND location ILIKE ${`%${filters!.location}%`}
        AND "employmentType" = ${filters!.employmentType}
        ORDER BY "createdAt" DESC LIMIT 50
      `
    } else if (hasIndustry && hasLocation) {
      result = await sql<Job>`
        SELECT * FROM jobs
        WHERE "isActive" = TRUE AND "expiresAt" > NOW()
        AND industry = ${filters!.industry}
        AND location ILIKE ${`%${filters!.location}%`}
        ORDER BY "createdAt" DESC LIMIT 50
      `
    } else if (hasIndustry && hasEmploymentType) {
      result = await sql<Job>`
        SELECT * FROM jobs
        WHERE "isActive" = TRUE AND "expiresAt" > NOW()
        AND industry = ${filters!.industry}
        AND "employmentType" = ${filters!.employmentType}
        ORDER BY "createdAt" DESC LIMIT 50
      `
    } else if (hasLocation && hasEmploymentType) {
      result = await sql<Job>`
        SELECT * FROM jobs
        WHERE "isActive" = TRUE AND "expiresAt" > NOW()
        AND location ILIKE ${`%${filters!.location}%`}
        AND "employmentType" = ${filters!.employmentType}
        ORDER BY "createdAt" DESC LIMIT 50
      `
    } else if (hasIndustry) {
      result = await sql<Job>`
        SELECT * FROM jobs
        WHERE "isActive" = TRUE AND "expiresAt" > NOW()
        AND industry = ${filters!.industry}
        ORDER BY "createdAt" DESC LIMIT 50
      `
    } else if (hasLocation) {
      result = await sql<Job>`
        SELECT * FROM jobs
        WHERE "isActive" = TRUE AND "expiresAt" > NOW()
        AND location ILIKE ${`%${filters!.location}%`}
        ORDER BY "createdAt" DESC LIMIT 50
      `
    } else if (hasEmploymentType) {
      result = await sql<Job>`
        SELECT * FROM jobs
        WHERE "isActive" = TRUE AND "expiresAt" > NOW()
        AND "employmentType" = ${filters!.employmentType}
        ORDER BY "createdAt" DESC LIMIT 50
      `
    } else {
      result = await sql<Job>`
        SELECT * FROM jobs
        WHERE "isActive" = TRUE AND "expiresAt" > NOW()
        ORDER BY "createdAt" DESC LIMIT 50
      `
    }

    return result.rows
  } catch (error) {
    console.error("[v0] Error fetching active jobs:", error)
    return []
  }
}

export async function getEmployerActiveJobCount(employerId: string): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM jobs WHERE "employerId" = ${employerId} AND "isActive" = TRUE
    `
    return Number.parseInt(result.rows[0]?.count || "0")
  } catch (error) {
    console.error("[v0] Error counting employer jobs:", error)
    return 0
  }
}

export async function createJob(data: {
  employerId: string
  title: string
  description: string
  location: string
  industry: string
  employmentType: "consulting" | "contract"
  visa?: string
  salaryMin?: number
  salaryMax?: number
}): Promise<Job | null> {
  try {
    const result = await sql<Job>`
      INSERT INTO jobs ("employerId", title, description, location, industry, "employmentType", visa, "salaryMin", "salaryMax")
      VALUES (${data.employerId}, ${data.title}, ${data.description}, ${data.location}, ${data.industry}, ${data.employmentType}, ${data.visa || null}, ${data.salaryMin || null}, ${data.salaryMax || null})
      RETURNING *
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("[v0] Error creating job:", error)
    return null
  }
}

// Payment queries
export async function createPayment(data: {
  userId: string
  stripeSessionId: string
  amount: number
  product: string
}): Promise<Payment | null> {
  try {
    const result = await sql<Payment>`
      INSERT INTO payments ("userId", "stripeSessionId", amount, product)
      VALUES (${data.userId}, ${data.stripeSessionId}, ${data.amount}, ${data.product})
      RETURNING *
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("[v0] Error creating payment:", error)
    return null
  }
}

export async function getPaymentBySessionId(sessionId: string): Promise<Payment | null> {
  try {
    const result = await sql<Payment>`
      SELECT * FROM payments WHERE "stripeSessionId" = ${sessionId} LIMIT 1
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("[v0] Error fetching payment:", error)
    return null
  }
}

// Resume queries
export async function createResume(data: {
  userId: string
  fileUrl: string
}): Promise<Resume | null> {
  try {
    const result = await sql<Resume>`
      INSERT INTO resumes ("userId", "fileUrl")
      VALUES (${data.userId}, ${data.fileUrl})
      RETURNING *
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("[v0] Error creating resume record:", error)
    return null
  }
}

// Utility: Run job expiration
export async function expireOldJobs(): Promise<void> {
  try {
    await sql`SELECT expire_old_jobs()`
  } catch (error) {
    console.error("[v0] Error expiring old jobs:", error)
  }
}
