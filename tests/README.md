# Playwright Test Suite

Automated end-to-end tests for STAR Workforce Solutions.

## Setup

Install Playwright:

\`\`\`bash
npm install -D @playwright/test
npx playwright install
\`\`\`

## Running Tests

\`\`\`bash
# Run all tests
npx playwright test

# Run tests in headed mode
npx playwright test --headed

# Run specific test file
npx playwright test tests/homepage.spec.ts

# Run tests in UI mode
npx playwright test --ui

# Run tests on specific browser
npx playwright test --project=chromium
\`\`\`

## Test Coverage

- **Homepage** (`homepage.spec.ts`) - Hero, features, navigation, responsive design
- **Authentication** (`auth.spec.ts`) - Login, signup, OAuth, magic links
- **Jobs** (`jobs.spec.ts`) - Job listings, filters, search
- **Contact** (`contact.spec.ts`) - Form validation, submission, auto-fill
- **ATS Optimizer** (`ats-optimizer.spec.ts`) - Upload, free/premium features
- **Employer Dashboard** (`employer.spec.ts`) - Job management, limits
- **API** (`api.spec.ts`) - Health check, endpoints, authentication

## Configuration

Tests use `playwright.config.ts` with:
- Base URL from `NEXT_PUBLIC_URL` or `http://localhost:3000`
- Screenshots on failure
- Traces on first retry
- Multiple browsers and devices

## Mocking External Services

For tests requiring auth or external services:

1. **OAuth**: Mock Google/LinkedIn responses
2. **Stripe**: Use Stripe test mode
3. **Database**: Use test database or mock data
4. **Email**: Mock SMTP server

## CI/CD Integration

Add to GitHub Actions:

\`\`\`yaml
- name: Install Playwright
  run: npx playwright install --with-deps
  
- name: Run Playwright tests
  run: npx playwright test
  
- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
\`\`\`

## Writing New Tests

Follow these patterns:

\`\`\`typescript
test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    await expect(page.locator('h1')).toContainText('Expected Text');
  });
});
\`\`\`

## Test Environment Variables

Set in `.env.test`:

\`\`\`
NEXT_PUBLIC_URL=http://localhost:3000
NEXTAUTH_SECRET=test-secret
DATABASE_URL=postgresql://...test
\`\`\`

## Troubleshooting

**Tests timing out**
- Increase timeout in test config
- Check if dev server is running
- Verify network connectivity

**Authentication tests failing**
- Set up test accounts
- Mock OAuth providers
- Check session configuration

**API tests failing**
- Verify API routes are working
- Check database connection
- Verify environment variables
\`\`\`
