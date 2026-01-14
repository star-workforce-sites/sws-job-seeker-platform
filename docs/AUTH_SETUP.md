# Authentication Setup Guide

## NextAuth.js Configuration

STAR Workforce Solutions uses NextAuth.js for authentication with multiple providers.

### Supported Authentication Methods

1. **Google OAuth** - Sign in with Google account
2. **LinkedIn OAuth** - Sign in with LinkedIn account
3. **Email Magic Links** - Passwordless email authentication

---

## Environment Variables Required

Add these to your Vercel project environment variables:

### NextAuth Base Configuration

\`\`\`bash
# NextAuth.js Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-secret-here

# NextAuth URL (your production URL)
NEXTAUTH_URL=https://www.starworkforcesolutions.com
\`\`\`

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://www.starworkforcesolutions.com/api/auth/callback/google` (production)

\`\`\`bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
\`\`\`

### LinkedIn OAuth

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create a new app
3. Add **Sign In with LinkedIn** product
4. Under **Auth** tab, add redirect URLs:
   - `http://localhost:3000/api/auth/callback/linkedin` (development)
   - `https://www.starworkforcesolutions.com/api/auth/callback/linkedin` (production)

\`\`\`bash
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
\`\`\`

### Email Provider (SMTP)

For magic link emails, configure SMTP settings:

\`\`\`bash
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@starworkforcesolutions.com
\`\`\`

**Gmail Setup:**
1. Enable 2-factor authentication on your Google account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the app password as `EMAIL_SERVER_PASSWORD`

**Alternative: SendGrid, Resend, or Postmark**
- Configure SMTP settings from your email service provider
- Recommended for production: Use a transactional email service

---

## Database Integration

NextAuth automatically uses your Vercel Postgres database for:
- User account storage
- Session management
- Email verification tokens

No additional configuration needed - it uses the existing schema from `/scripts/001_init_schema.sql`.

---

## User Roles

Users are assigned roles upon registration:
- **jobseeker** (default) - Job seekers
- **employer** - Verified employers
- **employer-pending** - Pending employer verification
- **admin** - Platform administrators

Role is stored in the `users` table and accessible via session:

\`\`\`typescript
import { getCurrentUser } from '@/lib/session';

const user = await getCurrentUser();
console.log(user?.role); // 'jobseeker', 'employer', 'admin'
\`\`\`

---

## Protected Routes

Use server-side authentication checks:

\`\`\`typescript
import { requireAuth, requireRole } from '@/lib/session';

// Require any authenticated user
const user = await requireAuth();

// Require specific role
const employer = await requireRole('employer');
\`\`\`

Use client-side session:

\`\`\`typescript
'use client';
import { useSession } from 'next-auth/react';

export default function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Access Denied</div>;
  
  return <div>Welcome {session?.user?.name}</div>;
}
\`\`\`

---

## Testing Authentication

1. Start development server: `npm run dev`
2. Navigate to `/auth/login`
3. Try each authentication method:
   - Click "Continue with Google"
   - Click "Continue with LinkedIn"
   - Enter email and click "Send Magic Link"

4. Check database:
\`\`\`sql
SELECT * FROM users ORDER BY "createdAt" DESC LIMIT 10;
\`\`\`

---

## Production Checklist

- [ ] Set `NEXTAUTH_SECRET` in Vercel
- [ ] Set `NEXTAUTH_URL` to production URL
- [ ] Configure Google OAuth with production redirect URI
- [ ] Configure LinkedIn OAuth with production redirect URI
- [ ] Set up SMTP for email provider
- [ ] Test all three sign-in methods
- [ ] Verify user roles are assigned correctly
- [ ] Test protected routes and role-based access

---

## Troubleshooting

**"Configuration error" on sign in**
- Check that all required environment variables are set
- Verify `NEXTAUTH_SECRET` is present
- Check `NEXTAUTH_URL` matches your domain

**OAuth redirect errors**
- Verify redirect URIs in Google/LinkedIn console match exactly
- Must include `/api/auth/callback/[provider]` path
- Check for trailing slashes

**Email not sending**
- Verify SMTP credentials are correct
- Check spam folder
- Test SMTP connection with a tool like `nodemailer`
- Consider using transactional email service for production

**Database errors**
- Ensure Vercel Postgres is connected
- Run migrations from `/scripts/` folder
- Check `POSTGRES_URL` environment variable is set
\`\`\`
