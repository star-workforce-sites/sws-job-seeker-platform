# Vercel Monitoring Setup for STAR Workforce Solutions

## Overview
This guide explains how to enable and use Vercel's built-in monitoring features.

## Enabling Vercel Monitoring

### 1. Vercel Web Analytics (Free)

**Enable in Vercel Dashboard:**

1. Go to: https://vercel.com/your-team/star-workforce-solutions
2. Click "Analytics" tab
3. Click "Enable Web Analytics"
4. Analytics will automatically start collecting data

**Features:**
- Page views and unique visitors
- Top pages and referrers
- Device and browser statistics
- Geographic data
- Real User Monitoring (RUM)

**No code changes needed** - automatically injected by Vercel.

### 2. Vercel Speed Insights (Free)

**Enable in Vercel Dashboard:**

1. Go to Project Settings
2. Click "Speed Insights"
3. Click "Enable Speed Insights"

**Features:**
- Real user performance data
- Core Web Vitals (LCP, FID, CLS)
- Performance scores
- Mobile vs Desktop comparison

### 3. Vercel Log Drains (Pro Plan)

For advanced logging to external services:

1. Go to Project Settings → Integrations
2. Add Log Drain integration
3. Configure endpoint (e.g., Datadog, LogDNA, Papertrail)

## Built-in Monitoring Features (Already Implemented)

### Function Logs

View real-time logs:

\`\`\`bash
# Via Vercel CLI
vercel logs --follow

# Or in Dashboard
# Go to: Deployments → Click deployment → View Function Logs
\`\`\`

All our `console.log` and `console.error` calls are automatically captured.

### Error Tracking

Our implementation includes:

1. **Server-side error logging** (lib/monitoring.ts)
   \`\`\`typescript
   import { reportError } from '@/lib/monitoring'
   
   try {
     // ... code
   } catch (error) {
     reportError(error, { userId, page: '/contact' }, 'high')
   }
   \`\`\`

2. **Client-side error boundary** (to be added below)

3. **API error responses** (already implemented in all API routes)

### Performance Tracking

Our middleware (middleware.ts) already tracks:
- Request/response times
- API endpoint latency
- HTTP status codes

## Using the Monitoring Dashboard

### Real-time Monitoring

**View live data:**

1. **Deployments Tab**
   - Shows all deployments
   - Click any to see logs

2. **Analytics Tab**
   - Visitor statistics
   - Top pages
   - Conversion funnels (Pro)

3. **Speed Insights Tab**
   - Core Web Vitals
   - Performance scores
   - Recommendations

### Setting Up Alerts (Pro Plan)

1. Go to Project Settings → Notifications
2. Configure alerts for:
   - Deployment failures
   - High error rates
   - Performance degradation
   - Quota limits

## Monitoring Best Practices

### 1. Structured Logging

We use prefixed logs for easy filtering:

\`\`\`typescript
console.log('[v0]', 'User action')        // Debug
console.log('[REQUEST]', { method, url }) // HTTP requests
console.log('[ERROR REPORT]', error)      // Errors
console.log('[PERFORMANCE]', metrics)     // Performance
\`\`\`

### 2. Error Severity Levels

\`\`\`typescript
reportError(error, context, 'low')      // Minor issues
reportError(error, context, 'medium')   // Default
reportError(error, context, 'high')     // User-impacting
reportError(error, context, 'critical') // System down
\`\`\`

### 3. Performance Tracking

\`\`\`typescript
import { trackPerformance } from '@/lib/monitoring'

const start = Date.now()
// ... expensive operation
trackPerformance('database-query', Date.now() - start)
\`\`\`

## Checking Monitoring Status

### 1. View Function Logs (CLI)

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs --follow
\`\`\`

### 2. View in Dashboard

Go to:
\`\`\`
https://vercel.com/your-team/star-workforce-solutions/logs
\`\`\`

### 3. Check Specific Deployment

\`\`\`
https://vercel.com/your-team/star-workforce-solutions/deployments/[deployment-id]
\`\`\`

## Integration with External Services (Optional)

### Sentry (Error Tracking)

\`\`\`bash
npm install @sentry/nextjs
\`\`\`

### LogRocket (Session Replay)

\`\`\`bash
npm install logrocket
\`\`\`

### Datadog (APM)

Add via Vercel Integrations marketplace.

## Current Monitoring Implementation Status

✅ **Implemented:**
- Server-side error logging
- Request/response tracking
- Performance monitoring
- SMTP connection logging
- Contact form tracking

🔲 **Recommended Additions:**
- Client-side error boundary (see below)
- Custom dashboard alerts
- Integration with external APM (if needed)

## Quick Start Checklist

1. ✅ Enable Web Analytics in Vercel Dashboard
2. ✅ Enable Speed Insights in Vercel Dashboard
3. ✅ Check Function Logs are working
4. ✅ Test error reporting with contact form
5. ✅ Review Analytics after 24-48 hours
6. ⬜ Set up alerts (Pro plan only)
7. ⬜ Consider external monitoring for high-traffic

## Support & Documentation

- Vercel Analytics: https://vercel.com/docs/analytics
- Speed Insights: https://vercel.com/docs/speed-insights
- Function Logs: https://vercel.com/docs/observability/runtime-logs
- Monitoring Guide: https://vercel.com/docs/observability
