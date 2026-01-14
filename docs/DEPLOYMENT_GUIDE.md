# Production Deployment Guide

Complete guide to deploying STAR Workforce Solutions to production.

## Pre-Deployment Checklist

### 1. Code Preparation

- [ ] All tests passing (`npx playwright test`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] API endpoints verified

### 2. Vercel Account Setup

- [ ] Vercel account created
- [ ] Project created in Vercel dashboard
- [ ] GitHub repository connected (optional)
- [ ] Custom domain configured (optional)

### 3. Database Setup

- [ ] Vercel Postgres database created
- [ ] Migrations run successfully
- [ ] Test data seeded (if needed)
- [ ] Connection pooling enabled
- [ ] Backup strategy configured

### 4. External Services

- [ ] Google OAuth configured with production URLs
- [ ] LinkedIn OAuth configured with production URLs
- [ ] Stripe account in live mode
- [ ] Stripe webhook configured
- [ ] SMTP email service configured
- [ ] Google Analytics property created

---

## Step-by-Step Deployment

### Step 1: Create Vercel Project

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel
\`\`\`

This creates a preview deployment.

### Step 2: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

**Required for Production:**
\`\`\`
POSTGRES_URL=...
POSTGRES_URL_NON_POOLING=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://www.starworkforcesolutions.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
EMAIL_SERVER_HOST=...
EMAIL_SERVER_USER=...
EMAIL_SERVER_PASSWORD=...
EMAIL_FROM=...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
BLOB_READ_WRITE_TOKEN=...
NEXT_PUBLIC_GA_ID=...
NEXT_PUBLIC_URL=https://www.starworkforcesolutions.com
CRON_SECRET=...
\`\`\`

### Step 3: Setup Vercel Storage

1. **Postgres Database**:
   - Navigate to Storage → Create → Postgres
   - Name: `star-workforce-db`
   - Region: Choose closest to users
   - Click Create

2. **Blob Storage**:
   - Navigate to Storage → Create → Blob
   - Name: `star-workforce-resumes`
   - Click Create

Environment variables are automatically added.

### Step 4: Run Database Migrations

\`\`\`bash
# Pull environment variables
vercel env pull .env.local

# Run migrations
psql $POSTGRES_URL_NON_POOLING -f scripts/001_init_schema.sql
psql $POSTGRES_URL_NON_POOLING -f scripts/002_seed_admin.sql
\`\`\`

Verify:
\`\`\`bash
psql $POSTGRES_URL_NON_POOLING -c "SELECT * FROM users LIMIT 5;"
\`\`\`

### Step 5: Configure OAuth Providers

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Credentials → OAuth 2.0 Client IDs → Your client
4. Add Authorized redirect URI:
   - `https://www.starworkforcesolutions.com/api/auth/callback/google`
5. Save

**LinkedIn OAuth:**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Select your app
3. Auth tab → Redirect URLs
4. Add: `https://www.starworkforcesolutions.com/api/auth/callback/linkedin`
5. Save

### Step 6: Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to Live mode
3. Developers → Webhooks → Add endpoint
4. Endpoint URL: `https://www.starworkforcesolutions.com/api/stripe/webhook`
5. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. Copy webhook signing secret
7. Add to Vercel as `STRIPE_WEBHOOK_SECRET`

### Step 7: Configure Vercel Cron

Vercel automatically reads `vercel.json`:

\`\`\`json
{
  "crons": [{
    "path": "/api/cron/expire-jobs",
    "schedule": "0 0 * * *"
  }]
}
\`\`\`

This runs daily at midnight UTC to expire old jobs.

### Step 8: Deploy to Production

\`\`\`bash
# Deploy to production
vercel --prod
\`\`\`

Or push to `main` branch if GitHub integration is enabled.

### Step 9: Verify Deployment

Test all critical paths:

\`\`\`bash
# Health check
curl https://www.starworkforcesolutions.com/api/health

# Homepage
curl https://www.starworkforcesolutions.com/

# Jobs API
curl https://www.starworkforcesolutions.com/api/jobs/list
\`\`\`

Manual testing:
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Sign in with Google
- [ ] Sign in with LinkedIn
- [ ] Sign in with email
- [ ] Upload resume
- [ ] Run ATS optimizer
- [ ] Make test payment
- [ ] Create employer job
- [ ] View job listings
- [ ] Submit contact form

### Step 10: Configure Custom Domain (Optional)

1. Vercel Dashboard → Settings → Domains
2. Add your domain: `starworkforcesolutions.com`
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 48 hours)
5. SSL certificate automatically provisioned

Update environment variables:
\`\`\`
NEXTAUTH_URL=https://starworkforcesolutions.com
NEXT_PUBLIC_URL=https://starworkforcesolutions.com
\`\`\`

Redeploy:
\`\`\`bash
vercel --prod
\`\`\`

---

## Post-Deployment

### Monitoring

1. **Vercel Analytics**:
   - Dashboard → Analytics
   - Monitor traffic, performance, errors

2. **Google Analytics**:
   - Check GA4 dashboard
   - Verify events tracking

3. **Stripe Dashboard**:
   - Monitor payments
   - Check for failed transactions

4. **Database Monitoring**:
   - Vercel Dashboard → Storage → Postgres
   - Monitor query performance
   - Check storage usage

### Backup Strategy

1. **Database Backups**:
   - Vercel Postgres includes automatic backups
   - Access via Vercel Dashboard → Storage → Backups

2. **Code Backups**:
   - GitHub repository (if connected)
   - Vercel deployment history

3. **Blob Storage**:
   - Consider external backup solution
   - Or use Vercel's built-in redundancy

### Maintenance

**Weekly:**
- Check error logs in Vercel
- Review Google Analytics for issues
- Monitor Stripe payments

**Monthly:**
- Review database performance
- Check storage usage
- Update dependencies (`npm update`)
- Review security advisories

**Quarterly:**
- Full security audit
- Performance optimization review
- User feedback review
- Feature roadmap update

---

## Troubleshooting

### Deployment Fails

**Build errors:**
\`\`\`bash
# Check build locally
npm run build

# Fix TypeScript errors
npm run type-check
\`\`\`

**Environment variable issues:**
- Verify all required vars are set in Vercel
- Check for typos in variable names
- Ensure values don't have trailing spaces

### Database Connection Fails

- Verify `POSTGRES_URL` is set
- Check database is in same region as function
- Use pooled connection (`POSTGRES_URL` not `POSTGRES_URL_NON_POOLING`)

### OAuth Not Working

- Verify redirect URIs match exactly (including https://)
- Check client IDs and secrets are correct
- Ensure `NEXTAUTH_URL` matches production URL
- Clear browser cookies and try again

### Stripe Webhook Fails

- Check webhook signature in Stripe Dashboard
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check Vercel logs for webhook errors
- Test with Stripe CLI: `stripe trigger checkout.session.completed`

### Cron Job Not Running

- Verify `vercel.json` is in project root
- Check Vercel Dashboard → Cron Jobs
- Verify `CRON_SECRET` is set
- Check function logs for errors

---

## Security Best Practices

1. **Environment Variables**:
   - Never commit secrets to Git
   - Use Vercel's encrypted environment variables
   - Rotate secrets regularly

2. **Authentication**:
   - Use strong `NEXTAUTH_SECRET`
   - Enable 2FA for admin accounts
   - Monitor failed login attempts

3. **Database**:
   - Use connection pooling
   - Regularly review user data
   - Implement rate limiting

4. **API Routes**:
   - Always verify authentication
   - Validate all inputs
   - Use parameterized queries

5. **Stripe**:
   - Always verify webhook signatures
   - Never expose secret key
   - Monitor for fraudulent transactions

---

## Scaling Considerations

**When you reach 10,000 users:**
- Consider upgrading Vercel plan
- Implement Redis caching
- Add CDN for static assets
- Optimize database queries
- Consider database read replicas

**When you reach 100,000 users:**
- Move to dedicated infrastructure
- Implement load balancing
- Add database sharding
- Consider microservices architecture
- Implement advanced monitoring

---

## Support Contacts

- **Vercel Support**: https://vercel.com/help
- **Stripe Support**: https://support.stripe.com
- **Next.js Docs**: https://nextjs.org/docs

---

**Deployment complete! Your platform is now live.**
\`\`\`
