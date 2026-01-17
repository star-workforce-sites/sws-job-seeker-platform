# Authentication Routing Test Checklist

## Manual Testing Steps

### 1. Login Page (https://www.starworkforcesolutions.com/auth/login)
- [ ] Page loads without errors
- [ ] Email input works
- [ ] Password input works
- [ ] "Sign In" button works
- [ ] "Forgot password?" link → /auth/forgot-password ✓
- [ ] "Sign up" link → /auth/register ✓
- [ ] "Sign in with Google" button triggers Google OAuth
- [ ] "Sign in with LinkedIn" button triggers LinkedIn OAuth
- [ ] Form validation works (required fields)

### 2. Register Page (https://www.starworkforcesolutions.com/auth/register)
- [ ] Page loads without errors
- [ ] Name input works
- [ ] Email input works
- [ ] Password input works
- [ ] Confirm password input works
- [ ] Password match validation works
- [ ] "Create Account" button works
- [ ] "Sign in" link → /auth/login ✓
- [ ] "Sign up with Google" button triggers Google OAuth
- [ ] "Sign up with LinkedIn" button triggers LinkedIn OAuth

### 3. Forgot Password Page (https://www.starworkforcesolutions.com/auth/forgot-password)
- [ ] Page loads without errors
- [ ] Email input works
- [ ] "Send Reset Instructions" button works
- [ ] Success message shows after submission
- [ ] "Back to Sign In" link → /auth/login ✓
- [ ] "Sign in" link → /auth/login ✓

### 4. Hire Recruiter Page (https://www.starworkforcesolutions.com/hire-recruiter)
- [ ] Page loads without errors
- [ ] Header is visible
- [ ] Footer is visible
- [ ] Shows 3 pricing cards
- [ ] "Choose Plan" buttons work
- [ ] Not authenticated → Redirects to /auth/login?callbackUrl=/hire-recruiter
- [ ] After login → Redirects back to /hire-recruiter
- [ ] Authenticated → Redirects to Stripe checkout

### 5. OAuth Callback Testing

#### Google OAuth Flow:
1. Click "Sign in with Google" on /auth/login
2. Should redirect to Google OAuth consent screen
3. After consent, should redirect to /api/auth/callback/google
4. Should create/update user in database
5. Should redirect to callbackUrl or dashboard

#### LinkedIn OAuth Flow:
1. Click "Sign in with LinkedIn" on /auth/login
2. Should redirect to LinkedIn OAuth consent screen
3. After consent, should redirect to /api/auth/callback/linkedin
4. Should create/update user in database
5. Should redirect to callbackUrl or dashboard

## URL Testing Matrix

| Current URL | Action | Expected Redirect | Status |
|-------------|--------|-------------------|--------|
| /hire-recruiter | Click "Choose Plan" (not logged in) | /auth/login?callbackUrl=/hire-recruiter | ⏳ |
| /auth/login?callbackUrl=/hire-recruiter | Sign in successfully | /hire-recruiter | ⏳ |
| /auth/login | Click "Forgot password?" | /auth/forgot-password | ⏳ |
| /auth/login | Click "Sign up" | /auth/register | ⏳ |
| /auth/register | Click "Sign in" | /auth/login | ⏳ |
| /auth/forgot-password | Click "Sign in" | /auth/login | ⏳ |
| /auth/forgot-password | Click "Back to Sign In" | /auth/login | ⏳ |

## Issues Found

### Pages Incorrectly Routing to /contact:
(To be filled after grep search)

### Missing Routes:
- [ ] /api/auth/register (POST endpoint)
- [ ] /api/auth/forgot-password (POST endpoint)

## Next Steps
1. Run this script to create auth pages
2. Test each URL manually
3. Fix any remaining routing issues
4. Update any pages still routing to /contact
