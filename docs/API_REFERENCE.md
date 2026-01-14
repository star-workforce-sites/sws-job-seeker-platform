# API Reference

Complete API documentation for STAR Workforce Solutions.

---

## Authentication

All protected endpoints require authentication via NextAuth session.

**Session Cookie**: `next-auth.session-token`

---

## Health & Status

### GET /api/health

Health check endpoint for monitoring.

**Response:**
\`\`\`json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "connected",
    "api": "running"
  }
}
\`\`\`

---

## User Endpoints

### GET /api/user/profile

Get current user's profile.

**Auth Required**: Yes

**Response:**
\`\`\`json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "jobseeker",
    "atsPremium": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
\`\`\`

### PATCH /api/user/profile

Update current user's profile.

**Auth Required**: Yes

**Request Body:**
\`\`\`json
{
  "name": "New Name"
}
\`\`\`

**Response:**
\`\`\`json
{
  "user": { ...updated user object }
}
\`\`\`

### GET /api/user/resumes

Get current user's uploaded resumes.

**Auth Required**: Yes

**Response:**
\`\`\`json
{
  "resumes": [
    {
      "id": "uuid",
      "userId": "uuid",
      "fileUrl": "https://...blob.vercel-storage.com/...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
\`\`\`

---

## Resume Upload

### POST /api/upload/resume

Upload a resume file.

**Auth Required**: Yes

**Request**: multipart/form-data
\`\`\`
file: <File> (PDF/DOC/DOCX, max 5MB)
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "url": "https://...blob.vercel-storage.com/...",
  "resumeId": "uuid"
}
\`\`\`

**Errors:**
- 400: Invalid file type or size
- 401: Unauthorized
- 500: Upload failed

---

## Job Listings

### GET /api/jobs/list

Get active job listings with optional filters.

**Auth Required**: No

**Query Parameters:**
- `industry` (optional): Filter by industry
- `location` (optional): Filter by location
- `employmentType` (optional): "consulting" or "contract"

**Example:**
\`\`\`
GET /api/jobs/list?industry=Software&location=Remote
\`\`\`

**Response:**
\`\`\`json
{
  "jobs": [
    {
      "id": "uuid",
      "employerId": "uuid",
      "title": "Senior Cloud Engineer",
      "description": "...",
      "location": "Remote",
      "industry": "Software",
      "employmentType": "contract",
      "visa": "H-1B",
      "salaryMin": 120000,
      "salaryMax": 150000,
      "expiresAt": "2024-02-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isActive": true
    }
  ]
}
\`\`\`

---

## Employer Endpoints

### GET /api/jobs/employer/list

Get employer's own jobs (active and inactive).

**Auth Required**: Yes (employer role)

**Response:**
\`\`\`json
{
  "jobs": [ ...job objects ]
}
\`\`\`

### POST /api/employer/jobs/create

Create a new job posting.

**Auth Required**: Yes (employer role)

**Request Body:**
\`\`\`json
{
  "title": "Senior Cloud Engineer",
  "description": "Looking for...",
  "location": "Remote",
  "industry": "Software",
  "employmentType": "contract",
  "visa": "H-1B",
  "salaryMin": 120000,
  "salaryMax": 150000
}
\`\`\`

**Response:**
\`\`\`json
{
  "job": { ...created job object }
}
\`\`\`

**Errors:**
- 400: Invalid data or max jobs exceeded
- 401: Unauthorized
- 403: Forbidden (not employer)

### POST /api/jobs/[id]/deactivate

Deactivate a job posting.

**Auth Required**: Yes (employer role, own jobs only)

**Response:**
\`\`\`json
{
  "success": true,
  "job": { ...deactivated job object }
}
\`\`\`

---

## Payment Endpoints

### POST /api/stripe/checkout

Create a Stripe checkout session.

**Auth Required**: Yes

**Request Body:**
\`\`\`json
{
  "product": "ATS_OPTIMIZER"
}
\`\`\`

**Valid Products:**
- `ATS_OPTIMIZER` - $5.00
- `PROFESSIONAL_PLAN` - $49.00/month
- `ENTERPRISE_PLAN` - $149.00/month

**Response:**
\`\`\`json
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
\`\`\`

### POST /api/stripe/webhook

Stripe webhook handler.

**Auth**: Stripe signature verification

**Handled Events:**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

---

## ATS Optimizer

### POST /api/ats-free

Get free ATS analysis (limited).

**Auth Required**: Yes

**Request Body:**
\`\`\`json
{
  "resumeText": "..."
}
\`\`\`

**Response:**
\`\`\`json
{
  "score": 75,
  "keywords": ["...5 keywords..."],
  "issues": ["...2 issues..."],
  "tips": ["...2 tips..."]
}
\`\`\`

### POST /api/ats-full

Get full ATS analysis (premium).

**Auth Required**: Yes (atsPremium: true)

**Request Body:**
\`\`\`json
{
  "resumeText": "..."
}
\`\`\`

**Response:**
\`\`\`json
{
  "score": 75,
  "keywords": ["...all keywords..."],
  "issues": ["...all issues..."],
  "tips": ["...all tips..."],
  "sections": { ...detailed analysis },
  "jobAlignment": 85
}
\`\`\`

---

## Contact Form

### POST /api/contact

Submit contact form.

**Auth Required**: No

**Request Body:**
\`\`\`json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "General Inquiry",
  "message": "..."
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

---

## Cron Jobs

### GET /api/cron/expire-jobs

Auto-expire jobs after 30 days.

**Auth**: Bearer token (CRON_SECRET)

**Schedule**: Daily at midnight

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Expired old jobs"
}
\`\`\`

---

## Error Responses

All endpoints return standard error format:

\`\`\`json
{
  "error": "Error message"
}
\`\`\`

**Status Codes:**
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
- 503: Service Unavailable

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding for production:
- Contact form: 5 requests/hour per IP
- Resume upload: 10 uploads/day per user
- Job creation: 5 jobs/day per employer

---

## CORS

All API routes support same-origin requests only.

For external API access, configure CORS headers in Next.js middleware.
\`\`\`
