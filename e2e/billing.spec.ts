import { test, expect, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function loginAndGoToSettings(page: Page): Promise<void> {
  const fixturePath = path.join(process.cwd(), 'e2e', 'fixtures', 'test-user.json');
  const { email, password } = JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as {
    id: string;
    email: string;
    password: string;
  };

  await page.goto('/signin');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();

  await page.waitForURL(/\/(onboarding|chat\/)/, { timeout: 15_000 });

  if (page.url().includes('/onboarding')) {
    await page.getByRole('button', { name: /skip/i }).click();
    await page.waitForURL(/\/chat\//, { timeout: 15_000 });
  }

  await page.goto('/settings');
  await page.waitForURL('**/settings', { timeout: 10_000 });
}

test('billing portal redirect (mocked)', async ({ page }) => {
  // Step 1: Set up route intercept BEFORE login
  await page.route('**/api/subscription/portal', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: 'https://billing.stripe.com/p/session/test_e2e_mock_session_id' }),
    });
  });

  // Step 2: Login and navigate to /settings
  await loginAndGoToSettings(page);

  // Step 3: Set up waitForURL promise before clicking
  const navigationPromise = page.waitForURL(/billing\.stripe\.com/, { timeout: 15_000 });

  // Step 4: Click "Manage Billing" button
  await page.getByRole('button', { name: /manage billing/i }).click();

  // Step 5: Await navigation
  await navigationPromise;

  // Step 6: Verify page.url() contains billing.stripe.com
  expect(page.url()).toContain('billing.stripe.com');
});
