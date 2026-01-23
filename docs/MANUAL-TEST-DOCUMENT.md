# STAR Workforce Solutions - Manual Test Document
## QA Testing Guide | Version 1.0 | January 21, 2026

---

# TESTING OVERVIEW

**Production URL:** https://www.starworkforcesolutions.com

**Test Accounts:**
- Use your own Google account for OAuth testing
- For Stripe payments, use test card: `4242 4242 4242 4242`

**Browser Requirements:**
- Chrome (latest), Firefox (latest), Safari (latest)
- Mobile: iOS Safari, Android Chrome

---

# TEST CASE CATEGORIES

1. [Authentication Tests](#1-authentication-tests)
2. [Navigation Tests](#2-navigation-tests)
3. [Homepage Tests](#3-homepage-tests)
4. [Jobs Page Tests](#4-jobs-page-tests)
5. [Hire Recruiter Tests](#5-hire-recruiter-tests)
6. [Dashboard Tests](#6-dashboard-tests)
7. [Contact Page Tests](#7-contact-page-tests)
8. [Services Page Tests](#8-services-page-tests)
9. [Pricing Page Tests](#9-pricing-page-tests)
10. [Tools Tests](#10-tools-tests)
11. [Payment Tests](#11-payment-tests)
12. [Mobile Responsiveness Tests](#12-mobile-responsiveness-tests)
13. [Error Handling Tests](#13-error-handling-tests)

---

# 1. AUTHENTICATION TESTS

## TEST 1.1: Google OAuth Login
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Go to https://www.starworkforcesolutions.com | Homepage loads | | |
| 2 | Click "Sign In" button in navigation | Redirects to /auth/login | | |
| 3 | Click "Continue with Google" | Google OAuth popup appears | | |
| 4 | Select/enter Google account | Authentication proceeds | | |
| 5 | After Google auth completes | Redirects to /dashboard | | |
| 6 | Check navigation bar | Shows user name and "Dashboard" link | | |
| 7 | Check URL | Should be /dashboard/job-seeker | | |

## TEST 1.2: LinkedIn OAuth Login
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Go to /auth/login | Login page loads | | |
| 2 | Click "Continue with LinkedIn" | LinkedIn OAuth popup appears | | |
| 3 | Complete LinkedIn authentication | Redirects to /dashboard | | |
| 4 | Check navigation | Shows user name | | |

## TEST 1.3: Sign Out
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | While logged in, click Sign Out icon | User is logged out | | |
| 2 | Check navigation | Shows "Sign In" and "Get Started" | | |
| 3 | Check URL | Redirects to homepage | | |
| 4 | Try accessing /dashboard | Redirects to /auth/login | | |

## TEST 1.4: Protected Route Access (Not Logged In)
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Clear cookies/logout | Not authenticated | | |
| 2 | Go to /dashboard | Redirects to /auth/login | | |
| 3 | Go to /dashboard/job-seeker | Redirects to /auth/login | | |

## TEST 1.5: Login with Callback URL
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Go to /hire-recruiter | Page loads | | |
| 2 | Click "Choose Plan" (not logged in) | Redirects to login with callbackUrl | | |
| 3 | Complete Google login | Returns to /hire-recruiter | | |

---

# 2. NAVIGATION TESTS

## TEST 2.1: Navigation Links (Logged Out)
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Click STAR logo | Goes to homepage | | |
| 2 | Click "Services" | Goes to /services | | |
| 3 | Click "ATS Optimizer" | Goes to /tools/ats-optimizer | | |
| 4 | Click "Distribution Wizard" | Goes to /distribution-wizard | | |
| 5 | Click "Job Search" | Goes to /jobs | | |
| 6 | Click "Pricing" | Goes to /pricing | | |
| 7 | Click "Contact" | Goes to /contact | | |
| 8 | Click "Sign In" | Goes to /auth/login | | |
| 9 | Click "Get Started" | Goes to /auth/signup | | |

## TEST 2.2: Navigation Links (Logged In)
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Login first | User authenticated | | |
| 2 | Check navigation shows user name | User name/avatar visible | | |
| 3 | Click "Dashboard" link | Goes to /dashboard | | |
| 4 | Click user avatar/name area | No dropdown (just display) | | |
| 5 | Click logout icon | Logs out user | | |

## TEST 2.3: Mobile Navigation
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Resize browser to mobile (<768px) | Hamburger menu appears | | |
| 2 | Click hamburger icon | Mobile menu opens | | |
| 3 | Verify all links present | All nav links visible | | |
| 4 | Click any link | Navigates and closes menu | | |
| 5 | Click X to close | Menu closes | | |

## TEST 2.4: Navigation Consistency
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Check nav on /hire-recruiter | Same header as homepage | | |
| 2 | Check nav on /jobs | Same header as homepage | | |
| 3 | Check nav on /contact | Same header as homepage | | |
| 4 | Check nav on /dashboard/job-seeker | Same header as homepage | | |

---

# 3. HOMEPAGE TESTS

## TEST 3.1: Homepage Load
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Go to https://www.starworkforcesolutions.com | Page loads completely | | |
| 2 | Check page title | "STAR Workforce Solutions..." | | |
| 3 | Check hero section | Visible with CTA buttons | | |
| 4 | Check services section | All services displayed | | |
| 5 | Scroll to footer | Footer with links visible | | |

## TEST 3.2: Homepage CTAs
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Click "Get Started" in hero | Goes to /auth/signup | | |
| 2 | Click "Learn More" | Scrolls or navigates appropriately | | |
| 3 | Click service cards | Navigate to respective pages | | |

## TEST 3.3: Footer Links
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Click "Terms of Service" | Goes to /legal/terms | | |
| 2 | Click "Privacy Policy" | Goes to /legal/privacy | | |
| 3 | Click social media icons | Open in new tab | | |

---

# 4. JOBS PAGE TESTS

## TEST 4.1: Jobs Page Load
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Go to /jobs | Page loads | | |
| 2 | Check job listings | 20 jobs displayed | | |
| 3 | Check job card info | Title, company, location, salary visible | | |

## TEST 4.2: Jobs Search
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Type "Engineer" in search | Results filter to engineer jobs | | |
| 2 | Clear search | All jobs show again | | |
| 3 | Type "Python" | Python-related jobs show | | |
| 4 | Type "ZZZZZ" (no matches) | "No jobs found" message | | |

## TEST 4.3: Jobs Filters
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Select "Remote" filter | Only remote jobs show | | |
| 2 | Select "Hybrid" filter | Only hybrid jobs show | | |
| 3 | Select "All" filter | All jobs show | | |

## TEST 4.4: Job Actions (Logged Out)
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Click "Apply Now" on a job | Button shows "Login to Apply" or redirects | | |
| 2 | Click "Save" on a job | Button disabled or shows login prompt | | |

## TEST 4.5: Job Actions (Logged In)
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Login first | Authenticated | | |
| 2 | Go to /jobs | Jobs page loads | | |
| 3 | Click "Apply Now" | Application submitted message | | |
| 4 | Click "Save" | Job saved, button changes | | |
| 5 | Click "Save" again | Job unsaved | | |

---

# 5. HIRE RECRUITER TESTS

## TEST 5.1: Page Layout
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Go to /hire-recruiter | Page loads | | |
| 2 | Check header | Same navigation as homepage | | |
| 3 | Check 3 plan cards visible | Basic, Standard, Pro | | |
| 4 | Check prices | $199, $399, $599 | | |
| 5 | Check "MOST POPULAR" badge | On Standard plan | | |
| 6 | Check footer | Same footer as homepage | | |

## TEST 5.2: Plan Features
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Check Basic features | 3-5 applications/day listed | | |
| 2 | Check Standard features | 10-15 applications/day listed | | |
| 3 | Check Pro features | 20-30 applications/day listed | | |

## TEST 5.3: Choose Plan (Not Logged In)
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Logout if logged in | Not authenticated | | |
| 2 | Click "Choose Plan" on Basic | Redirects to /auth/login | | |
| 3 | Check URL has callbackUrl | ?callbackUrl=/hire-recruiter | | |

## TEST 5.4: Choose Plan (Logged In)
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Login first | Authenticated | | |
| 2 | Go to /hire-recruiter | Page loads | | |
| 3 | Click "Choose Plan" on Basic | "Processing..." appears | | |
| 4 | Wait for redirect | Stripe checkout page opens | | |
| 5 | Verify Stripe shows $199/month | Correct price displayed | | |

---

# 6. DASHBOARD TESTS

## TEST 6.1: Dashboard Routing
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Login as regular user | Authenticated | | |
| 2 | Go to /dashboard | Redirects to /dashboard/job-seeker | | |
| 3 | Check loading spinner | Shows briefly during redirect | | |

## TEST 6.2: Job Seeker Dashboard Content
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Verify welcome message | "Welcome back, [Name]!" | | |
| 2 | Check tool cards visible | ATS, Cover Letter, Hire Recruiter, etc. | | |
| 3 | Check stats cards | Resumes Optimized, Cover Letters, etc. | | |
| 4 | Check Current Plan | Shows "Free" or subscription status | | |

## TEST 6.3: Dashboard Navigation
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Click "ATS Optimizer" card | Goes to /tools/ats-optimizer | | |
| 2 | Click "Cover Letter" card | Goes to /tools/cover-letter | | |
| 3 | Click "Hire a Recruiter" card | Goes to /hire-recruiter | | |
| 4 | Click "Interview Prep" card | Goes to /tools/interview-prep | | |
| 5 | Click "Job Search" card | Goes to /jobs | | |
| 6 | Click "Resume Distribution" card | Goes to /distribution-wizard | | |

---

# 7. CONTACT PAGE TESTS

## TEST 7.1: Page Layout
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Go to /contact | Page loads | | |
| 2 | Check form is at TOP | Contact form visible first | | |
| 3 | Check contact details below | 4 compact cards (Email, Phone, Address, Hours) | | |
| 4 | Check form fields | Name, Email, Subject dropdown, Message | | |

## TEST 7.2: Subject Dropdown
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Click subject dropdown | Dropdown opens | | |
| 2 | Verify "General Inquiry" option | Present | | |
| 3 | Verify "ATS Optimizer" option | Present | | |
| 4 | Verify "Hire Recruiter - Basic Plan" | Present | | |
| 5 | Verify "Hire Recruiter - Standard Plan" | Present | | |
| 6 | Verify "Hire Recruiter - Pro Plan" | Present | | |
| 7 | Verify "Billing & Payments" option | Present | | |
| 8 | Verify "Technical Support" option | Present | | |
| 9 | Count total options | Should be 14 options | | |

## TEST 7.3: Form Submission
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Fill in Name: "Test User" | Field accepts input | | |
| 2 | Fill in Email: "test@example.com" | Field accepts input | | |
| 3 | Select Subject: "General Inquiry" | Option selected | | |
| 4 | Fill in Message: "This is a test" | Field accepts input | | |
| 5 | Click "Send Message" | Button shows "Sending..." | | |
| 6 | Wait for response | Success message appears | | |
| 7 | Check success message | Green checkmark, "Message Sent!" | | |
| 8 | Check "Send Another Message" button | Button visible and works | | |

## TEST 7.4: Form Validation
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Leave Name empty, try submit | Validation error | | |
| 2 | Enter invalid email format | Validation error | | |
| 3 | Leave Message empty | Validation error | | |

## TEST 7.5: Pre-filled Subject
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Go to /contact?subject=ats-optimizer | Page loads | | |
| 2 | Check subject dropdown | "ATS Optimizer" pre-selected | | |

---

# 8. SERVICES PAGE TESTS

## TEST 8.1: Page Load
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Go to /services | Page loads | | |
| 2 | Check all service sections | Resume Distribution, Hire Recruiter, etc. | | |

## TEST 8.2: Service Links
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Check "Resume Distribution" button | Links appropriately (may go to /contact) | | |
| 2 | Check "Hire Recruiter" button | Should go to /hire-recruiter | | |
| 3 | Note any buttons going to /contact | Document for future fix | | |

---

# 9. PRICING PAGE TESTS

## TEST 9.1: Page Layout
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Go to /pricing | Page loads | | |
| 2 | Check Free Tier card | $0, features listed | | |
| 3 | Check ATS Optimizer card | $5 one-time | | |
| 4 | Check Employer Plans card | Free, Growth, Enterprise | | |

## TEST 9.2: Pricing CTAs
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Click "Start Free" | Goes to /tools/ats-optimizer | | |
| 2 | Click "Unlock Now" | Goes to /tools/ats-optimizer | | |
| 3 | Click "Contact Sales" | Goes to /contact | | |

---

# 10. TOOLS TESTS

## TEST 10.1: ATS Optimizer
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Go to /tools/ats-optimizer | Page loads | | |
| 2 | Check upload area | Resume upload zone visible | | |
| 3 | Upload a PDF resume | File accepted | | |
| 4 | Check free preview | Shows limited results (blurred) | | |
| 5 | Check "Unlock Full Analysis" | CTA visible | | |

## TEST 10.2: Cover Letter Generator
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Go to /tools/cover-letter | Page loads | | |
| 2 | Check input fields | Job title, company, description fields | | |
| 3 | Fill in fields | Accepts input | | |
| 4 | Generate preview | Shows result | | |

## TEST 10.3: Interview Prep
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Go to /tools/interview-prep | Page loads | | |
| 2 | Check setup options | Industry, role selection | | |
| 3 | Start practice session | Questions appear | | |

---

# 11. PAYMENT TESTS

## TEST 11.1: Stripe Checkout Flow
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Login | Authenticated | | |
| 2 | Go to /hire-recruiter | Page loads | | |
| 3 | Click "Choose Plan" (Basic) | Redirects to Stripe | | |
| 4 | Check Stripe page shows | $199.00/month | | |
| 5 | Check "Recruiter Basic" name | Product name visible | | |

## TEST 11.2: Complete Test Payment
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | On Stripe checkout page | Form visible | | |
| 2 | Enter card: 4242 4242 4242 4242 | Accepted | | |
| 3 | Enter expiry: 12/28 | Accepted | | |
| 4 | Enter CVC: 123 | Accepted | | |
| 5 | Enter name: Test User | Accepted | | |
| 6 | Enter ZIP: 75024 | Accepted | | |
| 7 | Click "Subscribe" | Processing... | | |
| 8 | Wait for completion | Redirects to success page | | |
| 9 | Check URL | /dashboard?success=true | | |

## TEST 11.3: Payment Cancellation
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Start checkout flow | Stripe page loads | | |
| 2 | Click back arrow or X | Returns to /hire-recruiter | | |
| 3 | Check no payment made | Verify in Stripe dashboard | | |

## TEST 11.4: Failed Payment
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Start checkout flow | Stripe page loads | | |
| 2 | Enter card: 4000 0000 0000 0002 | Decline test card | | |
| 3 | Complete other fields | All valid | | |
| 4 | Click "Subscribe" | Card declined error | | |

---

# 12. MOBILE RESPONSIVENESS TESTS

## TEST 12.1: Homepage Mobile
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Open homepage on mobile (or resize) | Layout responsive | | |
| 2 | Check hero section | Text readable, no overflow | | |
| 3 | Check navigation | Hamburger menu works | | |
| 4 | Check footer | Stacks vertically | | |

## TEST 12.2: Jobs Page Mobile
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Open /jobs on mobile | Layout responsive | | |
| 2 | Check job cards | Stack vertically | | |
| 3 | Check search bar | Full width | | |
| 4 | Check filters | Accessible | | |

## TEST 12.3: Hire Recruiter Mobile
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Open /hire-recruiter on mobile | Layout responsive | | |
| 2 | Check plan cards | Stack vertically | | |
| 3 | Check "Choose Plan" buttons | Tappable, not too small | | |

## TEST 12.4: Contact Page Mobile
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Open /contact on mobile | Layout responsive | | |
| 2 | Check form fields | Full width, easy to tap | | |
| 3 | Check subject dropdown | Opens correctly | | |

## TEST 12.5: Dashboard Mobile
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Login and go to dashboard | Layout responsive | | |
| 2 | Check tool cards | Stack in grid | | |
| 3 | Check stats cards | Readable | | |

---

# 13. ERROR HANDLING TESTS

## TEST 13.1: 404 Page
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Go to /nonexistent-page | 404 page displays | | |
| 2 | Check error message | Friendly message shown | | |
| 3 | Check navigation | Still accessible | | |

## TEST 13.2: Auth Error
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Go to /auth/error | Error page loads | | |
| 2 | Check error message | Explains the issue | | |
| 3 | Check "Back to Login" button | Returns to login | | |

## TEST 13.3: API Error Handling
| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Disable network, try action | Graceful error message | | |
| 2 | Re-enable network | Can retry | | |

---

# TEST SUMMARY SHEET

## Authentication
| Test ID | Test Name | Status | Tester | Date |
|---------|-----------|--------|--------|------|
| 1.1 | Google OAuth Login | | | |
| 1.2 | LinkedIn OAuth Login | | | |
| 1.3 | Sign Out | | | |
| 1.4 | Protected Route Access | | | |
| 1.5 | Login with Callback | | | |

## Navigation
| Test ID | Test Name | Status | Tester | Date |
|---------|-----------|--------|--------|------|
| 2.1 | Navigation Links (Logged Out) | | | |
| 2.2 | Navigation Links (Logged In) | | | |
| 2.3 | Mobile Navigation | | | |
| 2.4 | Navigation Consistency | | | |

## Jobs
| Test ID | Test Name | Status | Tester | Date |
|---------|-----------|--------|--------|------|
| 4.1 | Jobs Page Load | | | |
| 4.2 | Jobs Search | | | |
| 4.3 | Jobs Filters | | | |
| 4.4 | Job Actions (Logged Out) | | | |
| 4.5 | Job Actions (Logged In) | | | |

## Payments
| Test ID | Test Name | Status | Tester | Date |
|---------|-----------|--------|--------|------|
| 11.1 | Stripe Checkout Flow | | | |
| 11.2 | Complete Test Payment | | | |
| 11.3 | Payment Cancellation | | | |
| 11.4 | Failed Payment | | | |

---

# KNOWN ISSUES TO DOCUMENT

When testing, document any issues found:

| Issue # | Page | Description | Severity | Screenshot |
|---------|------|-------------|----------|------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

**Severity Levels:**
- **Critical:** Blocks major functionality, no workaround
- **High:** Major feature broken, workaround exists
- **Medium:** Minor feature issue, doesn't block usage
- **Low:** Cosmetic/UI issue

---

# FEEDBACK TEMPLATE

After testing, provide feedback in this format:

```
## Test Date: [Date]
## Tester Name: [Name]
## Browser/Device: [Chrome/Firefox/Safari, Desktop/Mobile]

### Tests Completed:
- [x] Authentication
- [x] Navigation
- [ ] Jobs
- [ ] Payments

### Issues Found:

#### Issue 1
- **Page:** [URL]
- **Steps to Reproduce:** 
  1. 
  2. 
  3. 
- **Expected:** 
- **Actual:** 
- **Screenshot:** [attach]
- **Severity:** [Critical/High/Medium/Low]

### General Feedback:
[Any overall observations about the site]
```

---

*Document Version: 1.0*
*Created: January 21, 2026*
