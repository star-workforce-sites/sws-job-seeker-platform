# Google SMTP Configuration for STAR Workforce Solutions

## Overview
This guide explains how to configure Gmail SMTP for sending emails from the contact form.

## Required Environment Variables

\`\`\`bash
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@starworkforcesolutions.com
\`\`\`

## Setup Steps

### Option 1: Gmail App Password (Recommended)

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Turn on 2-Step Verification

2. **Create App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it: "STAR Workforce Website"
   - Click "Generate"
   - Copy the 16-character password (remove spaces)

3. **Add to Vercel Environment Variables**
   \`\`\`
   EMAIL_SERVER_USER=your-email@gmail.com
   EMAIL_SERVER_PASSWORD=xxxx xxxx xxxx xxxx (the generated app password)
   \`\`\`

### Option 2: Less Secure Apps (Not Recommended)

**Note:** Google is phasing this out. Use App Passwords instead.

1. Go to: https://myaccount.google.com/lesssecureapps
2. Turn on "Allow less secure apps"
3. Use your regular Gmail password

### Option 3: OAuth2 (Most Secure, Complex Setup)

For production environments handling high volumes, consider OAuth2:

1. Create Google Cloud Project
2. Enable Gmail API
3. Create OAuth2 credentials
4. Implement OAuth2 flow in code

See: https://nodemailer.com/smtp/oauth2/

## Testing SMTP Connection

Run this test in your local environment:

\`\`\`typescript
// Test file: test-smtp.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Error:', error)
  } else {
    console.log('SMTP Ready:', success)
  }
})
\`\`\`

## Common Issues & Solutions

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution:**
- Enable 2FA and use App Password
- Make sure no spaces in the password
- Check if "Less secure app access" is on (if not using App Password)

### Error: "Connection timeout"

**Solution:**
- Check firewall settings
- Verify port 587 or 465 is not blocked
- Try port 465 with `secure: true`

### Error: "Self-signed certificate"

**Solution:**
Add to transporter config:
\`\`\`typescript
tls: {
  rejectUnauthorized: false
}
\`\`\`

### Error: "Daily sending quota exceeded"

**Solution:**
- Gmail free accounts: 500 emails/day
- Google Workspace: 2000 emails/day
- Consider using SendGrid or AWS SES for higher volumes

## Alternative Email Services

If Gmail doesn't work, consider:

1. **SendGrid** (Recommended for production)
   - 100 free emails/day
   - Better deliverability
   - https://sendgrid.com

2. **AWS SES**
   - Very affordable
   - High deliverability
   - Requires domain verification

3. **Resend** (Developer-friendly)
   - Modern API
   - Good free tier
   - https://resend.com

## Production Recommendations

For www.starworkforcesolutions.com production:

1. Use Gmail App Password initially
2. Monitor email volume
3. If > 200 emails/day, migrate to SendGrid or AWS SES
4. Set up SPF, DKIM, and DMARC records for better deliverability
5. Use a custom domain email (not @gmail.com) for professional appearance

## Vercel Configuration

In Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add:
   - `EMAIL_SERVER_HOST`
   - `EMAIL_SERVER_PORT`
   - `EMAIL_SERVER_USER`
   - `EMAIL_SERVER_PASSWORD`
   - `EMAIL_FROM`
3. Redeploy the application

## Testing in Production

After deployment, test the contact form:

1. Submit a test message
2. Check Vercel Logs for SMTP status
3. Verify email arrives at info@starworkforcesolutions.com
4. Check spam folder if not in inbox

## Support

If issues persist:
- Check Vercel Function Logs
- Review console output for `[v0]` tagged messages
- Contact Google Support for Gmail-specific issues
